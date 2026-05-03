/* ─── view.js — DOM rendering, no state reads ───────────────────────────────── */

const View = (() => {

  const $nav       = document.querySelector('.nav');
  const $ribbon    = document.querySelector('.ribbon');
  const $board     = document.querySelector('.board');
  const $drawer    = document.querySelector('.drawer');
  const $overlay   = document.querySelector('.overlay');
  const $modalWrap = document.querySelector('.modal-wrap');

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function assigneeClass(id) {
    const map = { t1: 'assignee-t1', t2: 'assignee-t2', t3: 'assignee-t3', t4: 'assignee-t4', you: 'assignee-you' };
    return map[id] || 'assignee-t1';
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  function isOverdue(iso) {
    if (!iso) return false;
    return new Date(iso) < new Date();
  }

  function formatTimestamp(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  function contentTagLabel(tag, categories) {
    const found = categories.find(c => c.value === tag);
    return found ? found.label : tag;
  }

  // ─── renderNav ─────────────────────────────────────────────────────────────
  function renderNav() {
    $nav.innerHTML = `
      <span class="nav-logo">House <span class="logo-of">of</span> Leap</span>
      <div class="nav-right">
        <span class="nav-gear" title="Settings">⚙</span>
        <a class="nav-avatar assignee-t3" href="client/index.html" target="_blank" title="Open Client Portal — Marzia Prine" style="text-decoration:none;">VP</a>
      </div>
    `;
  }

  // ─── renderClientRibbon ────────────────────────────────────────────────────
  function renderClientRibbon(clients, activeSlug) {
    const allTab = `
      <button class="ribbon-tab ${activeSlug === null ? 'active' : ''}" data-slug="">
        All Clients
      </button>
    `;
    const tabs = clients.map(c => `
      <button class="ribbon-tab ${activeSlug === c.slug ? 'active' : ''}" data-slug="${c.slug}">
        <span class="client-dot" style="background:${c.color}"></span>
        ${c.name}
        <span class="ribbon-tab-delete" data-action="delete-client" data-client-id="${c.id}" title="Delete client">✕</span>
      </button>
    `).join('');
    const addBtn = `
      <button class="ribbon-add-client" data-action="add-client">+ Add Client</button>
    `;
    $ribbon.innerHTML = allTab + tabs + addBtn;
  }

  // ─── renderBoard ───────────────────────────────────────────────────────────
  function renderBoard(tasks, projects, statuses, statusLabels, clients, team, categories, projectMeta) {
    $board.innerHTML = '';

    projects.forEach(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const meta   = projectMeta[project.id] || { isOpen: false, canClose: false };
      const client = clients.find(c => c.id === project.clientId);
      $board.appendChild(renderProjectSection(project, client, projectTasks, statuses, statusLabels, meta.isOpen, meta.canClose, clients, team, categories));
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'board-add-project';
    addBtn.dataset.action = 'add-project';
    addBtn.textContent = '+ New Project';
    $board.appendChild(addBtn);
  }

  // ─── renderProjectSection ──────────────────────────────────────────────────
  function renderProjectSection(project, client, tasks, statuses, statusLabels, isOpen, canClose, clients, team, categories) {
    const section = document.createElement('div');
    section.className = `project-section ${isOpen ? 'open' : ''} ${project.closed ? 'closed' : ''}`;
    section.dataset.projectId = project.id;

    const clientColor = client ? client.color : '#a9a9a9';
    const clientName  = client ? client.name  : '';
    const isClosed    = !!project.closed;

    const closedBadge = isClosed
      ? `<span class="project-closed-badge">✓ Closed</span>`
      : '';

    const closeBtn = isClosed
      ? `<button class="btn-reopen-project" data-action="reopen-project" data-project-id="${project.id}" title="Reopen project">Reopen</button>`
      : `<button class="btn-close-project ${canClose ? 'can-close' : ''}" data-action="close-project" data-project-id="${project.id}" title="${canClose ? 'Close project' : 'All tasks must be published to close'}">✓ Close</button>`;

    const addTaskBtn = isClosed
      ? ''
      : `<button class="btn-icon" data-action="add-task" data-project-id="${project.id}" title="Add task">+ Task</button>`;

    const header = document.createElement('div');
    header.className = 'project-header';
    header.dataset.action = 'toggle-project';
    header.dataset.projectId = project.id;
    header.innerHTML = `
      <div class="project-header-left">
        <span class="project-toggle-icon">▶</span>
        <span class="project-client-dot" style="background:${clientColor}"></span>
        <span class="project-name">${project.name}</span>
        <span class="project-client-label">${clientName}</span>
        ${closedBadge}
      </div>
      <div class="project-header-right">
        <span class="project-task-count">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</span>
        ${closeBtn}
        ${addTaskBtn}
        <button class="btn-icon btn-danger" data-action="delete-project" data-project-id="${project.id}" title="Delete project">🗑</button>
      </div>
    `;

    const kanban = document.createElement('div');
    kanban.className = `project-kanban ${isOpen ? '' : 'collapsed'}`;

    statuses.forEach(status => {
      kanban.appendChild(renderColumn(status, statusLabels[status], tasks.filter(t => t.status === status), clients, team, categories));
    });

    section.appendChild(header);
    section.appendChild(kanban);
    return section;
  }

  // ─── renderColumn ──────────────────────────────────────────────────────────
  function renderColumn(status, label, tasks, clients, team, categories) {
    const col = document.createElement('div');
    col.className = 'column';
    col.dataset.status = status;

    const header = document.createElement('div');
    header.className = 'column-header';
    header.innerHTML = `
      <span class="column-title">${label}</span>
      <span class="column-count">${tasks.length}</span>
    `;

    const cards = document.createElement('div');
    cards.className = 'column-cards';
    tasks.forEach(task => {
      const client   = clients.find(c => c.id === task.clientId);
      const assignee = team.find(m => m.id === task.assigneeId);
      cards.appendChild(renderCard(task, client, assignee, categories));
    });

    col.appendChild(header);
    col.appendChild(cards);
    return col;
  }

  // ─── renderCard ────────────────────────────────────────────────────────────
  function renderCard(task, client, assignee, categories) {
    const card = document.createElement('div');
    card.className = `card priority-${task.priority}`;
    card.dataset.taskId = task.id;

    const sym        = task.priority === 'high' ? '★' : task.priority === 'medium' ? '◆' : '○';
    const overdueCls = isOverdue(task.dueDate) && task.status !== 'published' ? ' overdue' : '';
    const clientBg   = client ? client.color : '#555';
    const clientName = client ? client.name  : '—';
    const initials   = assignee ? assignee.initials : '?';
    const attCount   = (task.attachments || []).length;
    const noteCount  = (task.internalNotes || []).length;

    const indicators = [
      attCount  > 0 ? `<span class="card-indicator" title="${attCount} attachment${attCount !== 1 ? 's' : ''}">📎 ${attCount}</span>` : '',
      noteCount > 0 ? `<span class="card-indicator" title="${noteCount} internal note${noteCount !== 1 ? 's' : ''}">🔒 ${noteCount}</span>` : ''
    ].filter(Boolean).join('');

    card.innerHTML = `
      <div class="card-top-row">
        <span class="card-client-tag" style="background:${clientBg}">${clientName}</span>
        <span class="card-priority-badge badge-${task.priority}">${sym}</span>
      </div>
      <div class="card-title">${task.title}</div>
      <div class="card-meta">
        <span class="card-content-tag tag">${contentTagLabel(task.contentTag, categories)}</span>
        ${indicators}
      </div>
      <div class="card-footer">
        <div class="card-assignee ${assigneeClass(task.assigneeId)}">${initials}</div>
        <span class="card-due${overdueCls}">${formatDate(task.dueDate)}</span>
      </div>
    `;
    return card;
  }

  // ─── renderDrawer ──────────────────────────────────────────────────────────
  function renderDrawer(task, clients, team, categories) {
    const client     = clients.find(c => c.id === task.clientId);
    const clientBg   = client ? client.color : '#555';
    const clientName = client ? client.name  : '—';

    const statusOptions   = STATUSES.map(s =>
      `<option value="${s}" ${task.status === s ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`
    ).join('');
    const priorityOptions = ['high', 'medium', 'low'].map(p =>
      `<option value="${p}" ${task.priority === p ? 'selected' : ''}>${p.charAt(0).toUpperCase() + p.slice(1)}</option>`
    ).join('');
    const assigneeOptions = team.map(m =>
      `<option value="${m.id}" ${task.assigneeId === m.id ? 'selected' : ''}>${m.name}</option>`
    ).join('');
    const categoryOptions = categories.map(c =>
      `<option value="${c.value}" ${task.contentTag === c.value ? 'selected' : ''}>${c.label}</option>`
    ).join('');

    $drawer.innerHTML = `
      <div class="drawer-header">
        <div style="flex:1;min-width:0;">
          <div class="drawer-header-meta">
            <span class="card-client-tag tag" style="background:${clientBg};font-size:10px;padding:2px 8px;border-radius:4px;color:#111;">${clientName}</span>
            <span class="card-content-tag tag">${contentTagLabel(task.contentTag, categories)}</span>
          </div>
          <input
            class="drawer-title-input"
            type="text"
            value="${task.title.replace(/"/g, '&quot;')}"
            data-action="title-edit"
            data-task-id="${task.id}"
          >
        </div>
        <button class="drawer-close" data-action="close">✕</button>
      </div>

      <div class="drawer-body">
        <div class="drawer-meta-grid">
          <div class="drawer-field">
            <label class="drawer-label">Status</label>
            <select class="drawer-select" data-action="status-change" data-task-id="${task.id}">
              ${statusOptions}
            </select>
          </div>
          <div class="drawer-field">
            <label class="drawer-label">Priority</label>
            <select class="drawer-select" data-action="priority-change" data-task-id="${task.id}">
              ${priorityOptions}
            </select>
          </div>
        </div>

        <div class="drawer-meta-grid">
          <div class="drawer-field">
            <label class="drawer-label">Assignee</label>
            <select class="drawer-select" data-action="assignee-change" data-task-id="${task.id}">
              ${assigneeOptions}
            </select>
          </div>
          <div class="drawer-field">
            <label class="drawer-label">Due Date</label>
            <input
              type="date"
              class="drawer-date-input"
              data-action="due-date-change"
              data-task-id="${task.id}"
              value="${task.dueDate || ''}"
            >
          </div>
        </div>

        <div class="drawer-field">
          <label class="drawer-label">
            Category
            <button class="drawer-label-action" data-action="manage-categories" type="button">⚙ Manage</button>
          </label>
          <select class="drawer-select" data-action="content-tag-change" data-task-id="${task.id}">
            ${categoryOptions}
          </select>
        </div>

        <div class="drawer-field">
          <label class="drawer-label">Description</label>
          <textarea
            class="drawer-textarea"
            data-action="description-edit"
            data-task-id="${task.id}"
            rows="4"
          >${task.description || ''}</textarea>
        </div>

        <div class="drawer-divider"></div>

        <!-- Attachments -->
        <div class="drawer-section-title">Attachments</div>
        <div class="attachment-list" id="attachment-list"></div>
        <div class="attachment-add-row">
          <input type="text" class="attachment-add-input" id="att-name-input" placeholder="Label (optional)">
          <input type="text" class="attachment-add-input" id="att-url-input" placeholder="https://…">
          <button class="attachment-add-btn" data-action="add-link" data-task-id="${task.id}" type="button">+ Link</button>
        </div>
        <div class="attachment-add-row" style="margin-top:6px;">
          <label class="attachment-file-label">
            <input type="file" class="attachment-file-input" data-action="attach-file" data-task-id="${task.id}">
            <span class="attachment-add-btn">📎 Attach File</span>
          </label>
        </div>

        <div class="drawer-divider"></div>

        <!-- Internal Notes -->
        <div class="internal-notes-header">
          <span class="drawer-section-title" style="margin-bottom:0;">Internal Notes</span>
          <span class="internal-badge">🔒 Team Only</span>
        </div>
        <div class="internal-note-list" id="internal-note-list"></div>
        <form class="internal-note-form" data-task-id="${task.id}">
          <textarea class="comment-input" placeholder="Add an internal note… (only visible to the team)" rows="2"></textarea>
          <button type="submit" class="btn-add-note">Add Note</button>
        </form>

        <div class="drawer-divider"></div>

        <!-- Comments -->
        <div class="drawer-section-title">Comments</div>
        <div class="comment-list" id="comment-list"></div>
        <form class="comment-form" data-task-id="${task.id}">
          <textarea class="comment-input" placeholder="Add a comment…" rows="3"></textarea>
          <button type="submit" class="comment-submit">Post Comment</button>
        </form>

        <div class="drawer-danger-zone">
          <button class="btn-delete-task" data-action="delete-task" data-task-id="${task.id}">
            Delete Task
          </button>
        </div>
      </div>
    `;

    renderAttachmentList(task.attachments || []);
    renderInternalNoteList(task.internalNotes || []);
    renderComments(task.comments, team);
  }

  // ─── renderAttachmentList ─────────────────────────────────────────────────
  function renderAttachmentList(attachments) {
    const $list = document.getElementById('attachment-list');
    if (!$list) return;

    if (!attachments || attachments.length === 0) {
      $list.innerHTML = '<p class="comment-empty">No attachments yet.</p>';
      return;
    }

    $list.innerHTML = attachments.map(a => {
      const icon   = a.type === 'file' ? '📄' : '🔗';
      const nameEl = a.url
        ? `<a href="${a.url}" target="_blank" rel="noopener">${a.name}</a>`
        : `<span>${a.name}</span>`;
      return `
        <div class="attachment-item">
          <span class="attachment-icon">${icon}</span>
          <span class="attachment-name">${nameEl}</span>
          <span class="attachment-meta">${a.addedBy}</span>
          <button class="attachment-remove" data-action="remove-attachment" data-att-id="${a.id}" title="Remove">✕</button>
        </div>
      `;
    }).join('');
  }

  // ─── renderInternalNoteList ───────────────────────────────────────────────
  function renderInternalNoteList(notes) {
    const $list = document.getElementById('internal-note-list');
    if (!$list) return;

    if (!notes || notes.length === 0) {
      $list.innerHTML = '<p class="comment-empty">No internal notes yet.</p>';
      return;
    }

    $list.innerHTML = notes.map(n => `
      <div class="internal-note-item">
        <div class="internal-note-meta">
          <span class="internal-note-author">${n.authorName}</span>
          <span class="internal-note-time">${formatTimestamp(n.timestamp)}</span>
        </div>
        <div class="internal-note-body">${n.body}</div>
      </div>
    `).join('');
  }

  // ─── renderComments ────────────────────────────────────────────────────────
  function renderComments(comments, team) {
    const $list = document.getElementById('comment-list');
    if (!$list) return;

    if (!comments || comments.length === 0) {
      $list.innerHTML = '<p class="comment-empty">No comments yet.</p>';
      return;
    }

    $list.innerHTML = comments.map(c => {
      const member   = team.find(m => m.id === c.authorId);
      const initials = member ? member.initials : c.authorName.substring(0, 2).toUpperCase();
      return `
        <div class="comment-item">
          <div class="comment-avatar ${assigneeClass(c.authorId)}">${initials}</div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">${c.authorName}</span>
              <span class="comment-time">${formatTimestamp(c.timestamp)}</span>
            </div>
            <div class="comment-body">${c.body}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ─── Project section DOM toggle ────────────────────────────────────────────
  function toggleProjectSection(projectId, isOpen) {
    const section = document.querySelector(`.project-section[data-project-id="${projectId}"]`);
    if (!section) return;
    section.classList.toggle('open', isOpen);
    section.querySelector('.project-kanban').classList.toggle('collapsed', !isOpen);
  }

  // ─── Drawer open / close ───────────────────────────────────────────────────
  function openDrawer()  { $drawer.classList.add('open');    $overlay.classList.add('visible'); }
  function closeDrawer() { $drawer.classList.remove('open'); $overlay.classList.remove('visible'); }

  // ─── Modal ─────────────────────────────────────────────────────────────────
  function showModal({ title, bodyHTML, confirmLabel = 'Confirm', danger = false, onConfirm }) {
    $modalWrap.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close-btn" data-action="modal-close">✕</button>
        </div>
        <div class="modal-body">
          ${bodyHTML}
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" data-action="modal-close">Cancel</button>
          <button class="btn-confirm ${danger ? 'btn-confirm-danger' : ''}" data-action="modal-confirm">
            ${confirmLabel}
          </button>
        </div>
      </div>
    `;
    $modalWrap.classList.add('visible');

    $modalWrap.querySelector('[data-action="modal-confirm"]').addEventListener('click', () => {
      const formData = {};
      $modalWrap.querySelectorAll('.modal-input, .modal-select, .modal-color-input').forEach(el => {
        if (el.name) formData[el.name] = el.value;
      });
      hideModal();
      onConfirm(formData);
    });

    $modalWrap.querySelectorAll('[data-action="modal-close"]').forEach(btn => {
      btn.addEventListener('click', hideModal);
    });
  }

  function hideModal() {
    $modalWrap.classList.remove('visible');
    $modalWrap.innerHTML = '';
  }

  return {
    renderNav,
    renderClientRibbon,
    renderBoard,
    renderColumn,
    renderCard,
    renderDrawer,
    openDrawer,
    closeDrawer,
    renderComments,
    renderAttachmentList,
    renderInternalNoteList,
    toggleProjectSection,
    showModal,
    hideModal
  };
})();
