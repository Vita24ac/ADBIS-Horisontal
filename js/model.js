/* ─── model.js — State, data, and pure functions ─────────────────────────────── */

const STATUSES = [
  'draft',
  'scoping',
  'ready_to_shoot',
  'ready_for_edit',
  'needs_review',
  'ready',
  'published'
];

const STATUS_LABELS = {
  draft:          'Draft',
  scoping:        'Scoping',
  ready_to_shoot: 'Ready to Shoot',
  ready_for_edit: 'Ready for Edit',
  needs_review:   'Needs Review',
  ready:          'Ready',
  published:      'Published'
};

// ─── Single source of truth ─────────────────────────────────────────────────
const state = {

  contentCategories: [
    { id: 'cat-reel',   value: 'reel',          label: 'Reel' },
    { id: 'cat-ytv',    value: 'youtube_video',  label: 'YT Video' },
    { id: 'cat-yts',    value: 'youtube_short',  label: 'YT Short' },
    { id: 'cat-story',  value: 'story',          label: 'Story' },
    { id: 'cat-static', value: 'static_post',    label: 'Static' },
    { id: 'cat-blog',   value: 'blog_post',      label: 'Blog' },
    { id: 'cat-ad',     value: 'ad_creative',    label: 'Ad' }
  ],

  projects: [
    { id: 'p1', name: 'YouTube Channel',   clientId: 'c1', closed: false },
    { id: 'p2', name: 'Instagram Growth',  clientId: 'c1', closed: false },
    { id: 'p3', name: 'Webinar Series',    clientId: 'c2', closed: false },
    { id: 'p4', name: 'Lead Gen Campaign', clientId: 'c2', closed: false },
    { id: 'p5', name: 'Brand Awareness',   clientId: 'c3', closed: false },
    { id: 'p6', name: 'Donation Drive',    clientId: 'c3', closed: false },
    { id: 'p7', name: 'Personal Brand Strategy', clientId: 'c4', closed: false },
    { id: 'p8', name: 'Social Media Launch',     clientId: 'c4', closed: false }
  ],

  tasks: [
    {
      id: 'task-01',
      title: 'Loop Fitness January Reel — Gym Transformation Story',
      status: 'draft',
      priority: 'high',
      contentTag: 'reel',
      clientId: 'c1',
      projectId: 'p2',
      assigneeId: 't1',
      dueDate: '2026-04-18',
      description: 'Create a compelling before/after gym transformation reel for Loop Fitness January campaign. Focus on emotional hook in first 3 seconds.',
      comments: [
        {
          id: 'cmt-01a',
          authorId: 't2',
          authorName: 'Christian',
          body: 'Mathias — can you send me the raw footage from last Tuesday? Need to review before scripting.',
          timestamp: '2026-04-10T09:14:00Z'
        },
        {
          id: 'cmt-01b',
          authorId: 't1',
          authorName: 'Mathias',
          body: 'Uploaded to shared drive. Folder is called /Loop-Jan-Raw. Let me know if access issues.',
          timestamp: '2026-04-10T11:32:00Z'
        }
      ],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-02',
      title: 'Innovator Circle — Welcome Email Sequence Blog Post',
      status: 'draft',
      priority: 'medium',
      contentTag: 'blog_post',
      clientId: 'c2',
      projectId: 'p3',
      assigneeId: 't3',
      dueDate: '2026-04-22',
      description: 'Write a 800-word blog post introducing new Innovator Circle members to the community values and expectations.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-03',
      title: 'Cares — Q2 Ad Creative Set (Static)',
      status: 'draft',
      priority: 'low',
      contentTag: 'ad_creative',
      clientId: 'c3',
      projectId: 'p5',
      assigneeId: 't4',
      dueDate: '2026-04-25',
      description: 'Design 3 static ad creatives for Cares Q2 campaign. Sizes: 1080x1080, 1080x1920, 1200x628.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-04',
      title: 'Loop Fitness — YouTube Channel Strategy Video',
      status: 'scoping',
      priority: 'high',
      contentTag: 'youtube_video',
      clientId: 'c1',
      projectId: 'p1',
      assigneeId: 't2',
      dueDate: '2026-04-20',
      description: 'Full production YouTube video covering Loop Fitness\'s new training methodology. 8-12 minutes. Script, shoot, and edit.',
      comments: [
        {
          id: 'cmt-04a',
          authorId: 't3',
          authorName: 'Victor',
          body: 'I\'ve drafted the script outline — three acts: Problem, Method, Results. Want to review it before we book the studio?',
          timestamp: '2026-04-09T14:20:00Z'
        },
        {
          id: 'cmt-04b',
          authorId: 't2',
          authorName: 'Christian',
          body: 'Yes, share the doc. Also we need to confirm the studio booking by Friday or we lose the slot.',
          timestamp: '2026-04-09T15:45:00Z'
        }
      ],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-05',
      title: 'Innovator Circle — Member Spotlight Story Series',
      status: 'scoping',
      priority: 'medium',
      contentTag: 'story',
      clientId: 'c2',
      projectId: 'p3',
      assigneeId: 't1',
      dueDate: '2026-04-24',
      description: 'Plan and produce a 5-part Instagram story series featuring IC member success stories. Needs interview questions and visual template.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-06',
      title: 'Cares — YouTube Short: "Why Cares Exists"',
      status: 'ready_to_shoot',
      priority: 'high',
      contentTag: 'youtube_short',
      clientId: 'c3',
      projectId: 'p5',
      assigneeId: 't3',
      dueDate: '2026-04-16',
      description: 'Short-form YouTube video (60s max) explaining Cares\' mission. Needs founder on camera. Script approved. Studio booked for Thursday.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-07',
      title: 'Loop Fitness — Static Post: New Class Schedule Launch',
      status: 'ready_to_shoot',
      priority: 'medium',
      contentTag: 'static_post',
      clientId: 'c1',
      projectId: 'p2',
      assigneeId: 't4',
      dueDate: '2026-04-17',
      description: 'Design and shoot product-style static post announcing Loop\'s new class schedule. Brand colors. Gym backdrop.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-08',
      title: 'Innovator Circle — Founder Interview Reel',
      status: 'ready_for_edit',
      priority: 'low',
      contentTag: 'reel',
      clientId: 'c2',
      projectId: 'p4',
      assigneeId: 't2',
      dueDate: '2026-04-19',
      description: 'Raw footage is in. Edit a 60s reel from 40min founder interview. Hook: first answer about failure. Use IC brand overlay.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-09',
      title: 'Cares — Blog Post: "5 Ways to Get Involved"',
      status: 'ready_for_edit',
      priority: 'medium',
      contentTag: 'blog_post',
      clientId: 'c3',
      projectId: 'p6',
      assigneeId: 't1',
      dueDate: '2026-04-21',
      description: 'SEO-optimised blog post targeting "how to volunteer in Denmark". 600 words. Draft written. Now needs final editing pass.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-10',
      title: 'Loop Fitness — YouTube Short: Morning Routine',
      status: 'needs_review',
      priority: 'medium',
      contentTag: 'youtube_short',
      clientId: 'c1',
      projectId: 'p1',
      assigneeId: 't3',
      dueDate: '2026-04-15',
      description: 'Edit complete. Waiting for client review. Video shows 5am morning routine at Loop gym. Music licensed via Epidemic Sound.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-11',
      title: 'Innovator Circle — Ad Creative: Q2 Lead Gen',
      status: 'needs_review',
      priority: 'high',
      contentTag: 'ad_creative',
      clientId: 'c2',
      projectId: 'p4',
      assigneeId: 't4',
      dueDate: '2026-04-14',
      description: 'Three ad variants for IC Q2 lead gen campaign. All designed. Needs approval from Mathias + IC contact before going live.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-12',
      title: 'Cares — Instagram Story: Donation Drive',
      status: 'ready',
      priority: 'low',
      contentTag: 'story',
      clientId: 'c3',
      projectId: 'p6',
      assigneeId: 't2',
      dueDate: '2026-04-16',
      description: 'Story sequence ready for publish. 7 slides. Link sticker to donation page. Schedule for 11am Friday.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-13',
      title: 'Loop Fitness — Static Post: Member of the Month',
      status: 'ready',
      priority: 'low',
      contentTag: 'static_post',
      clientId: 'c1',
      projectId: 'p2',
      assigneeId: 't1',
      dueDate: '2026-04-15',
      description: 'Member of the month post featuring Charles Alaocha. Photo edited. Caption written. Approved by client. Schedule for Thursday 12pm.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-14',
      title: 'Innovator Circle — Welcome Reel for New Cohort',
      status: 'published',
      priority: 'low',
      contentTag: 'reel',
      clientId: 'c2',
      projectId: 'p3',
      assigneeId: 't3',
      dueDate: '2026-04-10',
      description: 'Published April 10. Welcome reel for the new IC cohort. Reached 4,200 views in 48h. Client happy.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-15',
      title: 'Cares — YouTube Video: Annual Impact Report 2025',
      status: 'published',
      priority: 'medium',
      contentTag: 'youtube_video',
      clientId: 'c3',
      projectId: 'p5',
      assigneeId: 't4',
      dueDate: '2026-04-08',
      description: 'Published April 8. 12-minute documentary-style recap of Cares\' 2025 impact. 1,800 views. Strong watch time (68%).',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-16',
      title: 'Brand Identity Brief',
      status: 'scoping',
      priority: 'high',
      contentTag: 'blog_post',
      clientId: 'c4',
      projectId: 'p7',
      assigneeId: 't1',
      dueDate: '2026-05-05',
      description: 'Define brand voice, visual identity, and positioning for Marzia Prine personal brand. Covers tone of voice, audience personas, and key differentiators.',
      comments: [],
      internalNotes: [
        {
          id: 'note-16a',
          authorName: 'Mathias',
          body: 'Marzia mentioned she wants to position herself between "corporate strategist" and "creative entrepreneur" — keep this tension in the brief.',
          timestamp: '2026-04-22T09:30:00Z'
        }
      ],
      attachments: []
    },
    {
      id: 'task-17',
      title: 'LinkedIn Profile Rewrite',
      status: 'ready_for_edit',
      priority: 'medium',
      contentTag: 'static_post',
      clientId: 'c4',
      projectId: 'p7',
      assigneeId: 't3',
      dueDate: '2026-05-08',
      description: 'Full rewrite of LinkedIn profile — headline, about, and experience sections. Copy drafted, now needs final editing and formatting pass.',
      comments: [
        {
          id: 'cmt-17a',
          authorId: 't3',
          authorName: 'Victor',
          body: 'Draft is ready for your review, Marzia. I\'ve focused the headline on your consulting niche. Let me know if the tone feels right.',
          timestamp: '2026-04-24T14:10:00Z'
        }
      ],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-18',
      title: 'Thought Leadership Reel #1',
      status: 'needs_review',
      priority: 'high',
      contentTag: 'reel',
      clientId: 'c4',
      projectId: 'p7',
      assigneeId: 't2',
      dueDate: '2026-04-30',
      description: 'First reel in the thought leadership series. Topic: "Why I left corporate to go solo". Edit complete — awaiting Marzia\'s review before export.',
      comments: [
        {
          id: 'cmt-18a',
          authorId: 't2',
          authorName: 'Christian',
          body: 'Marzia — the edit is ready. Please pay special attention to the hook at 0:03 and let us know if the tone feels authentic to you.',
          timestamp: '2026-04-25T10:00:00Z'
        }
      ],
      internalNotes: [
        {
          id: 'note-18a',
          authorName: 'Victor',
          body: 'She mentioned wanting a warmer colour grade in our last call — flag this for the export pass once she approves the cut.',
          timestamp: '2026-04-25T11:15:00Z'
        }
      ],
      attachments: []
    },
    {
      id: 'task-19',
      title: 'Instagram Content Calendar — May',
      status: 'draft',
      priority: 'medium',
      contentTag: 'static_post',
      clientId: 'c4',
      projectId: 'p8',
      assigneeId: 't4',
      dueDate: '2026-05-01',
      description: 'Plan and schedule 12 posts for May Instagram launch. Mix of reels, carousels, and static posts aligned with brand brief.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-20',
      title: 'Launch Announcement Story Series',
      status: 'ready_to_shoot',
      priority: 'high',
      contentTag: 'story',
      clientId: 'c4',
      projectId: 'p8',
      assigneeId: 't1',
      dueDate: '2026-05-03',
      description: '5-slide Instagram story series announcing Marzia\'s brand launch. Script and visual template approved. Shoot scheduled for May 2nd.',
      comments: [],
      internalNotes: [],
      attachments: []
    },
    {
      id: 'task-21',
      title: 'YouTube Channel Intro Video',
      status: 'draft',
      priority: 'low',
      contentTag: 'youtube_video',
      clientId: 'c4',
      projectId: 'p8',
      assigneeId: 't3',
      dueDate: '2026-05-15',
      description: '60–90 second channel trailer for Marzia\'s YouTube presence. Script not yet started. Will follow brand identity brief once finalised.',
      comments: [],
      internalNotes: [],
      attachments: []
    }
  ],

  clients: [
    { id: 'c1', name: 'Loop Fitness',     slug: 'loop-fitness',     color: '#4CAF50' },
    { id: 'c2', name: 'Innovator Circle', slug: 'innovator-circle', color: '#9C6ADE' },
    { id: 'c3', name: 'Cares',            slug: 'cares',            color: '#E8734A' },
    { id: 'c4', name: 'Marzia Prince',    slug: 'marzia-prince',    color: '#7B68EE' }
  ],

  team: [
    { id: 't1', name: 'Mathias',  initials: 'MK' },
    { id: 't2', name: 'Christian', initials: 'CM' },
    { id: 't3', name: 'Victor',   initials: 'VP' },
    { id: 't4', name: 'Nicolai',  initials: 'NB' }
  ],

  activeClient: null,
  openTaskId: null,
  openProjects: new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'])
};

// ─── Priority sort order ─────────────────────────────────────────────────────
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

// ─── Model API ───────────────────────────────────────────────────────────────
const Model = {

  getClients() {
    return state.clients;
  },

  getTeam() {
    return state.team;
  },

  getProjects() {
    if (!state.activeClient) return state.projects;
    const client = state.clients.find(c => c.slug === state.activeClient);
    if (!client) return state.projects;
    return state.projects.filter(p => p.clientId === client.id);
  },

  getFilteredTasks() {
    let tasks = state.tasks;
    if (state.activeClient) {
      const client = state.clients.find(c => c.slug === state.activeClient);
      if (client) tasks = tasks.filter(t => t.clientId === client.id);
    }
    return [...tasks].sort((a, b) => {
      if (a.status !== b.status) return 0;
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });
  },

  getTaskById(id) {
    return state.tasks.find(t => t.id === id) || null;
  },

  setActiveClient(slug) {
    state.activeClient = slug || null;
  },

  setOpenTask(id) {
    state.openTaskId = id || null;
  },

  toggleProject(projectId) {
    if (state.openProjects.has(projectId)) {
      state.openProjects.delete(projectId);
    } else {
      state.openProjects.add(projectId);
    }
  },

  isProjectOpen(projectId) {
    return state.openProjects.has(projectId);
  },

  updateTask(id, patch) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    Object.assign(task, patch);
  },

  updateTaskStatus(id, newStatus) {
    if (STATUSES.includes(newStatus)) {
      this.updateTask(id, { status: newStatus });
    }
  },

  addComment(taskId, authorName, body) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.comments.push({
      id: 'cmt-' + Date.now(),
      authorId: 'you',
      authorName,
      body: body.trim(),
      timestamp: new Date().toISOString()
    });
  },

  // ─── Internal Notes ───────────────────────────────────────────────────────
  addInternalNote(taskId, authorName, body) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!task.internalNotes) task.internalNotes = [];
    task.internalNotes.push({
      id: 'note-' + Date.now(),
      authorName,
      body: body.trim(),
      timestamp: new Date().toISOString()
    });
  },

  // ─── Attachments ──────────────────────────────────────────────────────────
  addAttachment(taskId, type, name, url) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return null;
    if (!task.attachments) task.attachments = [];
    const att = {
      id: 'att-' + Date.now(),
      type,   // 'link' | 'file'
      name,
      url,
      addedBy: 'You',
      timestamp: new Date().toISOString()
    };
    task.attachments.push(att);
    return att.id;
  },

  removeAttachment(taskId, attachmentId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.attachments = (task.attachments || []).filter(a => a.id !== attachmentId);
  },

  // ─── Content Categories ───────────────────────────────────────────────────
  getContentCategories() {
    return state.contentCategories;
  },

  addContentCategory(label) {
    const value = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const id = 'cat-' + Date.now();
    state.contentCategories.push({ id, value, label: label.trim() });
    return value;
  },

  deleteContentCategory(id) {
    state.contentCategories = state.contentCategories.filter(c => c.id !== id);
  },

  // ─── Close Project ────────────────────────────────────────────────────────
  canCloseProject(projectId) {
    const tasks = state.tasks.filter(t => t.projectId === projectId);
    if (tasks.length === 0) return false;
    return tasks.every(t => t.status === 'published');
  },

  closeProject(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project || !this.canCloseProject(projectId)) return false;
    project.closed = true;
    return true;
  },

  reopenProject(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (project) project.closed = false;
  },

  isProjectClosed(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    return project ? !!project.closed : false;
  },

  // ─── Client CRUD ──────────────────────────────────────────────────────────
  addClient(name, color) {
    const id   = 'c' + Date.now();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    state.clients.push({ id, name, slug, color });
    return id;
  },

  deleteClient(clientId) {
    const projectIds = state.projects
      .filter(p => p.clientId === clientId)
      .map(p => p.id);
    state.tasks    = state.tasks.filter(t => !projectIds.includes(t.projectId));
    state.projects = state.projects.filter(p => p.clientId !== clientId);
    state.clients  = state.clients.filter(c => c.id !== clientId);
    if (state.activeClient) {
      const still = state.clients.find(c => c.slug === state.activeClient);
      if (!still) state.activeClient = null;
    }
  },

  // ─── Project CRUD ─────────────────────────────────────────────────────────
  addProject(name, clientId) {
    const id = 'p' + Date.now();
    state.projects.push({ id, name, clientId, closed: false });
    state.openProjects.add(id);
    return id;
  },

  deleteProject(projectId) {
    state.tasks    = state.tasks.filter(t => t.projectId !== projectId);
    state.projects = state.projects.filter(p => p.id !== projectId);
    state.openProjects.delete(projectId);
  },

  // ─── Task CRUD ────────────────────────────────────────────────────────────
  addTask(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return null;
    const id = 'task-' + Date.now();
    const defaultCat = state.contentCategories[0];
    const task = {
      id,
      title: 'New Task',
      status: 'draft',
      priority: 'medium',
      contentTag: defaultCat ? defaultCat.value : 'reel',
      clientId: project.clientId,
      projectId,
      assigneeId: state.team[0].id,
      dueDate: '',
      description: '',
      comments: [],
      internalNotes: [],
      attachments: []
    };
    state.tasks.push(task);
    return id;
  },

  deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    if (state.openTaskId === taskId) state.openTaskId = null;
  },

  getActiveClientSlug() {
    return state.activeClient;
  },

  getOpenTaskId() {
    return state.openTaskId;
  }
};
