/* ─── controller.js — Initialisation + event delegation ────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function getProjectMeta() {
    const meta = {};
    Model.getProjects().forEach(p => {
      meta[p.id] = {
        isOpen:   Model.isProjectOpen(p.id),
        canClose: Model.canCloseProject(p.id)
      };
    });
    return meta;
  }

  function refreshBoard() {
    View.renderBoard(
      Model.getFilteredTasks(),
      Model.getProjects(),
      STATUSES,
      STATUS_LABELS,
      Model.getClients(),
      Model.getTeam(),
      Model.getContentCategories(),
      getProjectMeta()
    );
  }

  function refreshRibbon() {
    View.renderClientRibbon(Model.getClients(), Model.getActiveClientSlug());
  }

  function refreshDrawer(taskId) {
    const task = Model.getTaskById(taskId);
    if (!task) return;
    View.renderDrawer(task, Model.getClients(), Model.getTeam(), Model.getContentCategories());
    View.openDrawer();
  }

  function buildCategoryListHTML() {
    const cats = Model.getContentCategories();
    if (cats.length === 0) {
      return '<p class="modal-cat-empty">No categories yet.</p>';
    }
    return cats.map(c => `
      <div class="modal-cat-item">
        <span class="modal-cat-name">${c.label}</span>
        <button class="modal-cat-delete btn-icon btn-danger" data-action="delete-category" data-cat-id="${c.id}" title="Delete">✕</button>
      </div>
    `).join('');
  }

  // ─── Initial render ───────────────────────────────────────────────────────
  View.renderNav();
  View.renderClientRibbon(Model.getClients(), Model.getActiveClientSlug());
  refreshBoard();

  // ─── Ribbon ───────────────────────────────────────────────────────────────
  document.querySelector('.ribbon').addEventListener('click', e => {
    const delBtn = e.target.closest('[data-action="delete-client"]');
    if (delBtn) {
      e.stopPropagation();
      const clientId   = delBtn.dataset.clientId;
      const client     = Model.getClients().find(c => c.id === clientId);
      const projCount  = Model.getProjects().filter(p => p.clientId === clientId).length;
      const taskCount  = Model.getFilteredTasks().filter(t => t.clientId === clientId).length;
      View.showModal({
        title: 'Delete Client',
        bodyHTML: `
          <p class="modal-message">
            Delete <strong>${client.name}</strong>?
            This will permanently remove <strong>${projCount} project${projCount !== 1 ? 's' : ''}</strong>
            and <strong>${taskCount} task${taskCount !== 1 ? 's' : ''}</strong>.
          </p>
        `,
        confirmLabel: 'Delete Client',
        danger: true,
        onConfirm: () => {
          Model.deleteClient(clientId);
          refreshRibbon();
          refreshBoard();
          View.closeDrawer();
        }
      });
      return;
    }

    if (e.target.closest('[data-action="add-client"]')) {
      View.showModal({
        title: 'Add Client',
        bodyHTML: `
          <div class="modal-field">
            <label class="modal-label">Client Name</label>
            <input class="modal-input" name="name" type="text" placeholder="e.g. Loop Fitness" autofocus>
          </div>
          <div class="modal-field">
            <label class="modal-label">Brand Color</label>
            <div class="modal-color-row">
              <input class="modal-color-input" name="color" type="color" value="#4CAF50">
              <span class="modal-color-preview">Pick a color for the client dot</span>
            </div>
          </div>
        `,
        confirmLabel: 'Create Client',
        danger: false,
        onConfirm: ({ name, color }) => {
          if (!name.trim()) return;
          Model.addClient(name.trim(), color);
          refreshRibbon();
          refreshBoard();
        }
      });
      return;
    }

    const tab = e.target.closest('.ribbon-tab');
    if (tab) {
      Model.setActiveClient(tab.dataset.slug || null);
      refreshRibbon();
      refreshBoard();
    }
  });

  // ─── Board ────────────────────────────────────────────────────────────────
  document.querySelector('.board').addEventListener('click', e => {
    // Add Task
    const addTaskBtn = e.target.closest('[data-action="add-task"]');
    if (addTaskBtn) {
      const projectId = addTaskBtn.dataset.projectId;
      const taskId    = Model.addTask(projectId);
      if (!taskId) return;
      if (!Model.isProjectOpen(projectId)) {
        Model.toggleProject(projectId);
        View.toggleProjectSection(projectId, true);
      }
      refreshBoard();
      Model.setOpenTask(taskId);
      refreshDrawer(taskId);
      View.openDrawer();
      return;
    }

    // Delete Project
    const delProjectBtn = e.target.closest('[data-action="delete-project"]');
    if (delProjectBtn) {
      e.stopPropagation();
      const projectId = delProjectBtn.dataset.projectId;
      const project   = Model.getProjects().find(p => p.id === projectId);
      const taskCount = Model.getFilteredTasks().filter(t => t.projectId === projectId).length;
      View.showModal({
        title: 'Delete Project',
        bodyHTML: `
          <p class="modal-message">
            Delete <strong>${project.name}</strong>?
            This will permanently remove <strong>${taskCount} task${taskCount !== 1 ? 's' : ''}</strong>.
          </p>
        `,
        confirmLabel: 'Delete Project',
        danger: true,
        onConfirm: () => {
          Model.deleteProject(projectId);
          refreshBoard();
          View.closeDrawer();
        }
      });
      return;
    }

    // Close Project
    const closeProjectBtn = e.target.closest('[data-action="close-project"]');
    if (closeProjectBtn) {
      e.stopPropagation();
      const projectId = closeProjectBtn.dataset.projectId;
      const project   = Model.getProjects().find(p => p.id === projectId);
      if (!Model.canCloseProject(projectId)) {
        const tasks     = Model.getFilteredTasks().filter(t => t.projectId === projectId);
        const remaining = tasks.filter(t => t.status !== 'published').length;
        View.showModal({
          title: 'Cannot Close Project',
          bodyHTML: `
            <p class="modal-message">
              <strong>${project.name}</strong> cannot be closed yet.
              <strong>${remaining} task${remaining !== 1 ? 's' : ''}</strong> still need${remaining === 1 ? 's' : ''} to be published.
            </p>
          `,
          confirmLabel: 'OK',
          danger: false,
          onConfirm: () => {}
        });
      } else {
        View.showModal({
          title: 'Close Project',
          bodyHTML: `
            <p class="modal-message">
              Close <strong>${project.name}</strong>? All tasks are published.
              No new tasks can be added once closed.
            </p>
          `,
          confirmLabel: 'Close Project',
          danger: false,
          onConfirm: () => {
            Model.closeProject(projectId);
            refreshBoard();
          }
        });
      }
      return;
    }

    // Reopen Project
    const reopenProjectBtn = e.target.closest('[data-action="reopen-project"]');
    if (reopenProjectBtn) {
      e.stopPropagation();
      const projectId = reopenProjectBtn.dataset.projectId;
      const project   = Model.getProjects().find(p => p.id === projectId);
      View.showModal({
        title: 'Reopen Project',
        bodyHTML: `<p class="modal-message">Reopen <strong>${project.name}</strong>? New tasks can be added again.</p>`,
        confirmLabel: 'Reopen',
        danger: false,
        onConfirm: () => {
          Model.reopenProject(projectId);
          refreshBoard();
        }
      });
      return;
    }

    // Add Project (bottom button)
    if (e.target.closest('[data-action="add-project"]')) {
      const clients = Model.getClients();
      if (clients.length === 0) {
        View.showModal({
          title: 'No Clients',
          bodyHTML: '<p class="modal-message">Create a client first before adding a project.</p>',
          confirmLabel: 'OK',
          danger: false,
          onConfirm: () => {}
        });
        return;
      }
      const clientOptions = clients.map(c =>
        `<option value="${c.id}">${c.name}</option>`
      ).join('');
      View.showModal({
        title: 'Add Project',
        bodyHTML: `
          <div class="modal-field">
            <label class="modal-label">Project Name</label>
            <input class="modal-input" name="name" type="text" placeholder="e.g. YouTube Channel" autofocus>
          </div>
          <div class="modal-field">
            <label class="modal-label">Client</label>
            <select class="modal-select" name="clientId">${clientOptions}</select>
          </div>
        `,
        confirmLabel: 'Create Project',
        danger: false,
        onConfirm: ({ name, clientId }) => {
          if (!name.trim()) return;
          Model.addProject(name.trim(), clientId);
          refreshBoard();
        }
      });
      return;
    }

    // Toggle project accordion
    const header = e.target.closest('[data-action="toggle-project"]');
    if (header) {
      const pid = header.dataset.projectId;
      Model.toggleProject(pid);
      View.toggleProjectSection(pid, Model.isProjectOpen(pid));
      return;
    }

    // Open task card
    const card = e.target.closest('.card');
    if (card) {
      const id = card.dataset.taskId;
      if (!id) return;
      Model.setOpenTask(id);
      refreshDrawer(id);
    }
  });

  // ─── Overlay — close drawer ───────────────────────────────────────────────
  document.querySelector('.overlay').addEventListener('click', () => {
    Model.setOpenTask(null);
    View.closeDrawer();
  });

  // ─── Drawer — clicks ─────────────────────────────────────────────────────
  document.querySelector('.drawer').addEventListener('click', e => {
    if (e.target.dataset.action === 'close') {
      Model.setOpenTask(null);
      View.closeDrawer();
      return;
    }

    // Delete Task
    const delTaskBtn = e.target.closest('[data-action="delete-task"]');
    if (delTaskBtn) {
      const taskId = delTaskBtn.dataset.taskId;
      const task   = Model.getTaskById(taskId);
      View.showModal({
        title: 'Delete Task',
        bodyHTML: `<p class="modal-message">Delete <strong>${task.title}</strong>? This cannot be undone.</p>`,
        confirmLabel: 'Delete Task',
        danger: true,
        onConfirm: () => {
          Model.deleteTask(taskId);
          View.closeDrawer();
          refreshBoard();
        }
      });
      return;
    }

    // Add link attachment
    const addLinkBtn = e.target.closest('[data-action="add-link"]');
    if (addLinkBtn) {
      const taskId    = addLinkBtn.dataset.taskId;
      const nameInput = document.getElementById('att-name-input');
      const urlInput  = document.getElementById('att-url-input');
      const url  = urlInput  ? urlInput.value.trim()  : '';
      const name = nameInput ? nameInput.value.trim() : '';
      if (!url) return;
      Model.addAttachment(taskId, 'link', name || url, url);
      if (nameInput) nameInput.value = '';
      if (urlInput)  urlInput.value  = '';
      View.renderAttachmentList(Model.getTaskById(taskId).attachments || []);
      refreshBoard();
      return;
    }

    // Remove attachment
    const removeAttBtn = e.target.closest('[data-action="remove-attachment"]');
    if (removeAttBtn) {
      const attId  = removeAttBtn.dataset.attId;
      const taskId = Model.getOpenTaskId();
      if (!taskId) return;
      Model.removeAttachment(taskId, attId);
      View.renderAttachmentList(Model.getTaskById(taskId).attachments || []);
      refreshBoard();
      return;
    }

    // Manage categories
    const manageCatBtn = e.target.closest('[data-action="manage-categories"]');
    if (manageCatBtn) {
      View.showModal({
        title: 'Manage Categories',
        bodyHTML: `
          <div class="modal-category-list" id="modal-cat-list">
            ${buildCategoryListHTML()}
          </div>
          <div class="modal-field" style="margin-top:16px; border-top:1px solid var(--border-default); padding-top:16px;">
            <label class="modal-label">New Category Name</label>
            <input class="modal-input" name="categoryName" type="text" placeholder="e.g. Podcast Clip" autocomplete="off">
          </div>
        `,
        confirmLabel: 'Add Category',
        danger: false,
        onConfirm: ({ categoryName }) => {
          if (categoryName && categoryName.trim()) {
            Model.addContentCategory(categoryName.trim());
          }
          const openTaskId = Model.getOpenTaskId();
          if (openTaskId) refreshDrawer(openTaskId);
        }
      });
      return;
    }
  });

  // ─── Modal-wrap — inline category delete ─────────────────────────────────
  document.querySelector('.modal-wrap').addEventListener('click', e => {
    const delCat = e.target.closest('[data-action="delete-category"]');
    if (delCat) {
      e.stopPropagation();
      Model.deleteContentCategory(delCat.dataset.catId);
      const list = document.getElementById('modal-cat-list');
      if (list) list.innerHTML = buildCategoryListHTML();
    }
  });

  // ─── Drawer — file input change ───────────────────────────────────────────
  document.querySelector('.drawer').addEventListener('change', e => {
    const el     = e.target;
    const taskId = el.dataset.taskId;

    // File attachment
    if (el.dataset.action === 'attach-file' && taskId) {
      const file = el.files && el.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      Model.addAttachment(taskId, 'file', file.name, url);
      View.renderAttachmentList(Model.getTaskById(taskId).attachments || []);
      refreshBoard();
      el.value = '';
      return;
    }

    if (!taskId) return;

    if (el.dataset.action === 'status-change') {
      Model.updateTaskStatus(taskId, el.value);
      refreshBoard();
      refreshDrawer(taskId);
    }
    if (el.dataset.action === 'priority-change') {
      Model.updateTask(taskId, { priority: el.value });
      refreshBoard();
      refreshDrawer(taskId);
    }
    if (el.dataset.action === 'assignee-change') {
      Model.updateTask(taskId, { assigneeId: el.value });
      refreshBoard();
      refreshDrawer(taskId);
    }
    if (el.dataset.action === 'due-date-change') {
      Model.updateTask(taskId, { dueDate: el.value });
      refreshBoard();
    }
    if (el.dataset.action === 'content-tag-change') {
      Model.updateTask(taskId, { contentTag: el.value });
      refreshBoard();
      refreshDrawer(taskId);
    }
  });

  // ─── Drawer — focusout (title + description inline edit) ─────────────────
  document.querySelector('.drawer').addEventListener('focusout', e => {
    const el     = e.target;
    const taskId = el.dataset.taskId;
    if (!taskId) return;

    if (el.dataset.action === 'title-edit') {
      const newTitle = el.value.trim();
      if (newTitle) {
        Model.updateTask(taskId, { title: newTitle });
        refreshBoard();
      }
    }
    if (el.dataset.action === 'description-edit') {
      Model.updateTask(taskId, { description: el.value });
    }
  });

  // ─── Drawer — submit (comments + internal notes) ──────────────────────────
  document.querySelector('.drawer').addEventListener('submit', e => {
    e.preventDefault();

    if (e.target.classList.contains('comment-form')) {
      const taskId = e.target.dataset.taskId;
      const input  = e.target.querySelector('.comment-input');
      const body   = input.value.trim();
      if (!body) return;
      Model.addComment(taskId, 'You', body);
      input.value = '';
      View.renderComments(Model.getTaskById(taskId).comments, Model.getTeam());
      return;
    }

    if (e.target.classList.contains('internal-note-form')) {
      const taskId = e.target.dataset.taskId;
      const input  = e.target.querySelector('.comment-input');
      const body   = input.value.trim();
      if (!body) return;
      Model.addInternalNote(taskId, 'You', body);
      input.value = '';
      View.renderInternalNoteList(Model.getTaskById(taskId).internalNotes || []);
      return;
    }
  });

  // ─── Escape — close drawer ────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.querySelector('.modal-wrap.visible')) {
        View.hideModal();
      } else {
        Model.setOpenTask(null);
        View.closeDrawer();
      }
    }
  });
});
