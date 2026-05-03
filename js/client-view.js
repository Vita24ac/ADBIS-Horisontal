/* ─── client-view.js — Read-only client portal rendering ────────────────────── */

const ClientView = (() => {

  const $nav       = document.querySelector('.nav');
  const $ribbon    = document.querySelector('.ribbon');
  const $board     = document.querySelector('.board');
  const $drawer    = document.querySelector('.drawer');
  const $overlay   = document.querySelector('.overlay');
  const $modalWrap = document.querySelector('.modal-wrap');

  // ─── Helpers (identical to view.js) ───────────────────────────────────────
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

  // ─── renderNav — client variant (no settings gear) ─────────────────────────
  function renderNav(client) {
    const initials = client ? client.name.split(' ').map(w => w[0]).join('').toUpperCase() : 'MP';
    const color    = client ? client.color : '#7B68EE';
    $nav.innerHTML = `
      <span class="nav-logo">House <span class="logo-of">of</span> Leap</span>
      <div class="nav-right">
        <a class="nav-avatar" href="../index.html" target="_blank" title="Open Employee Board" style="background:${color};color:#fff;text-decoration:none;">${initials}</a>
      </div>
    `;
  }

  // ─── renderClientRibbon — single static tab, no delete / add ──────────────
  function renderClientRibbon(client) {
    $ribbon.innerHTML = `
      <button class="ribbon-tab active" style="pointer-events:none;cursor:default;">
        <span class="client-dot" style="background:${client.color}"></span>
        ${client.name}
      </button>
    `;
  }

  // ─── renderBoard ───────────────────────────────────────────────────────────
  function renderBoard(tasks, projects, statuses, statusLabels, clients, team, categories, projectMeta) {
    $board.innerHTML = '';

    projects.forEach(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const meta   = projectMeta[project.id] || { isOpen: false };
      const client = clients.find(c => c.id === project.clientId);
      $board.appendChild(renderProjectSection(project, client, projectTasks, statuses, statusLabels, meta.isOpen, clients, team, categories));
    });
  }

  // ─── renderProjectSection — no admin buttons ───────────────────────────────
  function renderProjectSection(project, client, tasks, statuses, statusLabels, isOpen, clients, team, categories) {
    const section = document.createElement('div');
    section.className = `project-section ${isOpen ? 'open' : ''} ${project.closed ? 'closed' : ''}`;
    section.dataset.projectId = project.id;

    const clientColor = client ? client.color : '#a9a9a9';
    const clientName  = client ? client.name  : '';
    const isClosed    = !!project.closed;

    const closedBadge = isClosed
      ? `<span class="project-closed-badge">✓ Closed</span>`
      : '';

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

  // ─── renderCard — identical layout, no internal notes indicator ────────────
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

    const indicators = attCount > 0
      ? `<span class="card-indicator" title="${attCount} attachment${attCount !== 1 ? 's' : ''}">📎 ${attCount}</span>`
      : '';

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

  // ─── renderDrawer — read-only fields, no internal notes, no delete ─────────
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
            readonly
          >
        </div>
        <button class="drawer-close" data-action="close">✕</button>
      </div>

      <div class="drawer-body">
        <div class="drawer-meta-grid">
          <div class="drawer-field">
            <label class="drawer-label">Status</label>
            <select class="drawer-select" disabled>
              ${statusOptions}
            </select>
          </div>
          <div class="drawer-field">
            <label class="drawer-label">Priority</label>
            <select class="drawer-select" disabled>
              ${priorityOptions}
            </select>
          </div>
        </div>

        <div class="drawer-meta-grid">
          <div class="drawer-field">
            <label class="drawer-label">Assignee</label>
            <select class="drawer-select" disabled>
              ${assigneeOptions}
            </select>
          </div>
          <div class="drawer-field">
            <label class="drawer-label">Due Date</label>
            <input type="date" class="drawer-date-input" readonly value="${task.dueDate || ''}">
          </div>
        </div>

        <div class="drawer-field">
          <label class="drawer-label">Category</label>
          <select class="drawer-select" disabled>
            ${categoryOptions}
          </select>
        </div>

        <div class="drawer-field">
          <label class="drawer-label">Description</label>
          <textarea class="drawer-textarea" readonly rows="4">${task.description || ''}</textarea>
        </div>

        <div class="drawer-divider"></div>

        <!-- Attachments (view only) -->
        <div class="drawer-section-title">Attachments</div>
        <div class="attachment-list" id="attachment-list"></div>

        <div class="drawer-divider"></div>

        <!-- Comments (interactive) -->
        <div class="drawer-section-title">Comments</div>
        <div class="comment-list" id="comment-list"></div>
        <form class="comment-form" data-task-id="${task.id}">
          <textarea class="comment-input" placeholder="Add a comment…" rows="3"></textarea>
          <button type="submit" class="comment-submit">Post Comment</button>
        </form>
      </div>
    `;

    renderAttachmentList(task.attachments || []);
    renderComments(task.comments, team);
  }

  // ─── renderAttachmentList (view only — no remove button) ──────────────────
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
        </div>
      `;
    }).join('');
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
    toggleProjectSection
  };
})();
