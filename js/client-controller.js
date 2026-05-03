/* ─── client-controller.js — Read-only client portal, Marzia Prine ─────────── */

document.addEventListener('DOMContentLoaded', () => {

  const CLIENT_SLUG = 'marzia-prince';
  Model.setActiveClient(CLIENT_SLUG);

  const client = Model.getClients().find(c => c.slug === CLIENT_SLUG);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function getProjectMeta() {
    const meta = {};
    Model.getProjects().forEach(p => {
      meta[p.id] = { isOpen: Model.isProjectOpen(p.id) };
    });
    return meta;
  }

  function refreshBoard() {
    ClientView.renderBoard(
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

  function refreshDrawer(taskId) {
    const task = Model.getTaskById(taskId);
    if (!task) return;
    ClientView.renderDrawer(task, Model.getClients(), Model.getTeam(), Model.getContentCategories());
    ClientView.openDrawer();
  }

  // ─── Initial render ───────────────────────────────────────────────────────
  ClientView.renderNav(client);
  ClientView.renderClientRibbon(client);
  refreshBoard();

  // ─── Board — accordion toggle + card open ─────────────────────────────────
  document.querySelector('.board').addEventListener('click', e => {
    const header = e.target.closest('[data-action="toggle-project"]');
    if (header) {
      const pid = header.dataset.projectId;
      Model.toggleProject(pid);
      ClientView.toggleProjectSection(pid, Model.isProjectOpen(pid));
      return;
    }

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
    ClientView.closeDrawer();
  });

  // ─── Drawer — close button ────────────────────────────────────────────────
  document.querySelector('.drawer').addEventListener('click', e => {
    if (e.target.dataset.action === 'close') {
      Model.setOpenTask(null);
      ClientView.closeDrawer();
    }
  });

  // ─── Drawer — comment submit ──────────────────────────────────────────────
  document.querySelector('.drawer').addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.classList.contains('comment-form')) {
      const taskId = e.target.dataset.taskId;
      const input  = e.target.querySelector('.comment-input');
      const body   = input.value.trim();
      if (!body) return;
      Model.addComment(taskId, client ? client.name : 'Client', body);
      input.value = '';
      ClientView.renderComments(Model.getTaskById(taskId).comments, Model.getTeam());
    }
  });

  // ─── Escape — close drawer ────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      Model.setOpenTask(null);
      ClientView.closeDrawer();
    }
  });
});
