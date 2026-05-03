# CLAUDE.md — House of Leap Project Management System

## Project Overview

A project management system for **House of Leap** — a small digital agency of four partners (Victor, Christian, Mathias, Nicolai). Built as a **vanilla HTML/CSS/JS prototype** with no external dependencies or build tools.

The system solves coordination problems: missed deadlines, unclear task ownership, double work, and lack of client visibility.

---

## Tech Stack

- **HTML5** — semantic markup, no frameworks
- **CSS3** — one single `styles.css`, no preprocessors, no modules
- **JavaScript (ES6+)** — vanilla JS, classic MVC pattern, no npm packages
- **No build step** — open `index.html` directly in a browser

---

## File Structure

```
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── model.js        ← data, state, business logic
│   ├── view.js         ← DOM rendering functions
│   └── controller.js   ← event listeners, binds model ↔ view
├── assets/
│   └── logo.svg
└── CLAUDE.md
```

---

## MVC Responsibilities

### Model (`model.js`)
- Holds all application state: tasks, clients, team members
- Exposes pure functions: `getTasks()`, `getTasksByClient()`, `updateTaskStatus()`, `addComment()`, `getTaskById()`
- Sorting logic lives here: high priority tasks always returned first within each status group
- No DOM access — ever

### View (`view.js`)
- Contains only functions that create or update DOM elements
- Never reads or mutates state directly — receives data as arguments
- Key functions: `renderBoard(tasks)`, `renderClientRibbon(clients, activeClient)`, `renderTaskDrawer(task)`, `renderColumn(status, tasks)`
- Uses `document.createElement` and `innerHTML` — no jQuery

### Controller (`controller.js`)
- Initializes the app on `DOMContentLoaded`
- Attaches all event listeners (click, change, submit)
- Calls Model to read/update data, then calls View to re-render
- Handles: client tab switching, card click → drawer open, status change, comment submit

---

## Design System (all hardcoded in `styles.css`)

### Color Variables (CSS custom properties)

```css
:root {
  /* Backgrounds */
  --bg-primary:    #0d1a0d;
  --bg-secondary:  #111f11;
  --bg-elevated:   #172217;
  --bg-hover:      #1e2e1e;

  /* Accent */
  --accent-gold:        #c9a84c;
  --accent-gold-muted:  #a08030;
  --accent-gold-bright: #e5c06a;

  /* Text */
  --text-primary:   #f0ece4;
  --text-secondary: #9aaa94;
  --text-muted:     #5a6b56;

  /* Borders */
  --border-default: #1e2e1e;
  --border-strong:  #2e3f2e;

  /* Status column accents */
  --status-draft:        #3a3a3a;
  --status-scoping:      #2a3a5c;
  --status-ready-shoot:  #1e3a2a;
  --status-ready-edit:   #3a2a1e;
  --status-needs-review: #3a1e1e;
  --status-ready:        #1a3a1a;
  --status-published:    #c9a84c20;

  /* Priority */
  --priority-high:   #c94c4c;
  --priority-medium: #c9a84c;
  --priority-low:    #4c7a4c;

  /* Layout */
  --nav-height:    60px;
  --ribbon-height: 48px;
  --drawer-width:  480px;
  --column-width:  280px;
  --card-radius:   8px;
  --gap:           16px;
}
```

### Typography (loaded via Google Fonts `<link>` in HTML — no npm)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
body        { font-family: 'DM Sans', sans-serif; }
h1, h2, h3  { font-family: 'Playfair Display', serif; }
.tag, .mono { font-family: 'JetBrains Mono', monospace; }
```

### Design Rules

1. **No white backgrounds** — `--bg-primary` is the darkest layer, everything else layers on top
2. **Gold is sparse** — only active states, high priority indicators, focus rings
3. **Transitions** — all hover states use `transition: all 150ms ease`
4. **Cards lift on hover** — `transform: translateY(-2px)` + increased shadow
5. **No external icon libraries** — use Unicode symbols or inline SVG for icons (★ ⚙ ✕ ↗)

---

## UI Components (styled in `styles.css`)

### Top Navigation
```css
.nav { height: var(--nav-height); background: var(--bg-secondary); }
```
- Logo in Playfair Display, "of" styled in `--accent-gold`
- Right side: initials-avatar + settings gear (Unicode ⚙)

### Client Ribbon
```css
.ribbon { height: var(--ribbon-height); background: var(--bg-secondary); border-bottom: 1px solid var(--border-strong); }
.ribbon-tab.active { border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold); }
```

### Kanban Board
```css
.board { display: flex; gap: var(--gap); overflow-x: auto; padding: var(--gap); }
.column { width: var(--column-width); flex-shrink: 0; }
.column-header { border-left: 3px solid var(--status-draft); /* set dynamically per status */ }
```

### Task Card
```css
.card { background: var(--bg-secondary); border-radius: var(--card-radius); padding: 12px; cursor: pointer; transition: all 150ms ease; }
.card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
.card.priority-high { border-top: 2px solid var(--priority-high); }
```

### Task Drawer
```css
.drawer { position: fixed; top: 0; right: -100%; width: var(--drawer-width); height: 100vh; background: var(--bg-elevated); transition: right 250ms ease; z-index: 100; }
.drawer.open { right: 0; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: none; z-index: 99; }
.overlay.visible { display: block; }
```

---

## Data Model (hardcoded in `model.js`)

```javascript
const STATUSES = [
  'draft', 'scoping', 'ready_to_shoot',
  'ready_for_edit', 'needs_review', 'ready', 'published'
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

// Single source of truth
const state = {
  tasks:        [],
  clients:      [],
  team:         [],
  activeClient: null,  // null = show all
  openTaskId:   null
};
```

---

## Key Behaviours

1. **Priority sorting** — `model.js` always returns high-priority tasks first within a status group
2. **Client filtering** — controller passes `activeClient` to model, model filters, view re-renders board
3. **Drawer open/close** — controller sets `state.openTaskId`, view renders drawer and toggles `.open` class
4. **Comment submit** — controller catches submit event, calls `model.addComment()`, view re-renders comment list

---

## Out of Scope (prototype)

- Backend / database — all data is hardcoded in `model.js`
- Authentication
- Drag-and-drop — status is changed via dropdown inside the drawer
- File uploads
- Mobile layout
