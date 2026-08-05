const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(__dirname, 'dist');
fs.mkdirSync(outDir, { recursive: true });

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseChecklist(md, headingLine, stopAtNextHeading) {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => l.trim() === headingLine);
  const items = [];
  if (start === -1) return items;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (stopAtNextHeading && line.startsWith('## ')) break;
    const m = line.match(/^- \[( |x)\]\s*(.*)$/i);
    if (m && m[2].trim()) items.push({ done: m[1].toLowerCase() === 'x', text: m[2].trim() });
  }
  return items;
}

function parseBacklog(md) {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => l.trim() === '## Backlog');
  const pillars = {};
  let current = null;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ')) break;
    const h = line.match(/^### #(.+)$/);
    if (h) {
      current = h[1].trim();
      pillars[current] = [];
      continue;
    }
    const m = line.match(/^- \[( |x)\]\s*(.*)$/i);
    if (m && current && m[2].trim()) pillars[current].push(m[2].trim());
  }
  return pillars;
}

const STATUS = {
  G: { word: 'On track', color: '#22c55e' },
  Y: { word: 'Watch', color: '#eab308' },
  R: { word: 'At risk', color: '#ef4444' },
};

function parsePillar(md) {
  const role = (md.match(/\*\*Role:\*\*\s*(.*)/) || [])[1] || '';
  const objective = (md.match(/\*\*Objective:\*\*\s*(.*)/) || [])[1] || '';
  const signal = (md.match(/\*\*Health signal:\*\*\s*(.*)/) || [])[1] || '';
  const rows = [...md.matchAll(/^\|(?!-{3,})(.+)\|$/gm)]
    .map((r) => r[1].split('|').map((c) => c.trim()))
    .filter((cols) => cols.length >= 3 && cols[0] !== 'Date');
  const last = rows.length ? rows[rows.length - 1] : null;
  const status = last ? STATUS[last[2]] : null;
  return {
    role,
    objective,
    signal,
    latest: last ? last[1] : 'No data yet',
    statusWord: status ? status.word : 'Not set',
    color: status ? status.color : '#71717a',
  };
}

function countInboxItems(md) {
  return md
    .split('\n')
    .filter((l) => {
      const t = l.trim();
      return t.startsWith('-') && t.slice(1).trim().length > 0;
    }).length;
}

const tasksMd = read('Tasks.md');
const today = parseChecklist(tasksMd, '## Today', true);
const backlog = parseBacklog(tasksMd);
const finance = parsePillar(read('Pillars/Finance.md'));
const revenueOps = parsePillar(read('Pillars/Revenue-Ops.md'));
const inboxCount = countInboxItems(read('Inbox.md'));

function pillarCard(name, p) {
  return `
    <div class="stat-card" style="--accent:${p.color}">
      <div class="stat-top">
        <span class="stat-name">${escapeHtml(name)}</span>
        <span class="pill" style="background:${p.color}22;color:${p.color}">${escapeHtml(p.statusWord)}</span>
      </div>
      <p class="stat-value">${escapeHtml(p.latest)}</p>
      <p class="stat-label">${escapeHtml(p.signal)}</p>
      <p class="stat-objective">${escapeHtml(p.objective)}</p>
    </div>`;
}

function taskList(items) {
  if (!items.length) return '<p class="empty">Today list is empty — pull up to 3 from the backlog.</p>';
  return `<ul class="today-list">${items
    .map(
      (t) =>
        `<li class="${t.done ? 'done' : ''}"><span class="check">${t.done ? '✓' : ''}</span>${escapeHtml(t.text)}</li>`
    )
    .join('')}</ul>`;
}

const backlogSections = Object.entries(backlog)
  .map(
    ([tag, items]) => `
    <div class="backlog-group">
      <div class="backlog-head">
        <span class="tag">#${escapeHtml(tag)}</span>
        <span class="count">${items.length}</span>
      </div>
      ${items.length ? `<ul>${items.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : '<p class="empty">Empty.</p>'}
    </div>`
  )
  .join('');

const inboxState = inboxCount > 0 ? 'warn' : 'ok';
const inboxMessage =
  inboxCount > 0
    ? `${inboxCount} item${inboxCount === 1 ? '' : 's'} waiting to be clarified — clear it today`
    : 'Inbox clear';

const builtAt = new Date().toLocaleString('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'medium',
  timeStyle: 'short',
});

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RAM-OS Cockpit</title>
<style>
  :root {
    color-scheme: dark light;
    --bg: #0a0b0d;
    --bg-elevated: #131418;
    --border: #212329;
    --text: #edeef0;
    --muted: #8b8f98;
    --accent: #5eead4;
  }
  @media (prefers-color-scheme: light) {
    :root {
      --bg: #f4f4f2;
      --bg-elevated: #ffffff;
      --border: #e4e4e1;
      --text: #16171a;
      --muted: #71717a;
    }
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif;
    margin: 0;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 860px; margin: 0 auto; padding: 32px 20px 80px; }

  header { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
  .brand { display: flex; flex-direction: column; }
  .brand .kicker { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); font-weight: 600; margin-bottom: 4px; }
  h1 { font-size: 1.6rem; margin: 0; letter-spacing: -0.01em; }
  .built { color: var(--muted); font-size: 0.78rem; }

  .banner {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 12px; margin-bottom: 24px;
    font-size: 0.88rem; font-weight: 500;
    border: 1px solid transparent;
  }
  .banner.warn { background: #eab30818; border-color: #eab30840; color: #eab308; }
  .banner.ok { background: #22c55e18; border-color: #22c55e40; color: #22c55e; }
  .banner .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 28px; }
  .stat-card {
    position: relative;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 18px 18px 16px;
    overflow: hidden;
  }
  .stat-card::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--accent);
  }
  .stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .stat-name { font-size: 0.8rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .pill { font-size: 0.72rem; font-weight: 600; padding: 3px 9px; border-radius: 999px; }
  .stat-value { font-size: 1.15rem; font-weight: 600; margin: 0 0 2px; line-height: 1.3; }
  .stat-label { font-size: 0.75rem; color: var(--muted); margin: 0 0 10px; }
  .stat-objective { font-size: 0.82rem; color: var(--muted); margin: 0; padding-top: 10px; border-top: 1px solid var(--border); }

  .panel {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 18px 20px;
    margin-bottom: 16px;
  }
  .panel h2 { font-size: 0.95rem; margin: 0 0 12px; letter-spacing: -0.01em; }
  .empty { color: var(--muted); font-size: 0.85rem; font-style: italic; margin: 0; }

  ul.today-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  ul.today-list li {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.92rem; padding: 8px 10px; border-radius: 8px; background: var(--bg);
    border: 1px solid var(--border);
  }
  ul.today-list li .check {
    width: 18px; height: 18px; border-radius: 5px; border: 1px solid var(--muted);
    display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0;
    color: var(--accent); border-color: var(--accent);
  }
  ul.today-list li.done { color: var(--muted); text-decoration: line-through; }

  .backlog-group { padding: 12px 0; border-bottom: 1px solid var(--border); }
  .backlog-group:last-child { border-bottom: none; padding-bottom: 0; }
  .backlog-group:first-child { padding-top: 0; }
  .backlog-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .tag { font-size: 0.85rem; font-weight: 600; font-family: ui-monospace, Menlo, monospace; color: var(--accent); }
  .count { font-size: 0.75rem; color: var(--muted); background: var(--bg); border: 1px solid var(--border); padding: 1px 8px; border-radius: 999px; }
  .backlog-group ul { margin: 0; padding-left: 18px; }
  .backlog-group li { font-size: 0.88rem; margin: 4px 0; }

  footer { text-align: center; color: var(--muted); font-size: 0.75rem; margin-top: 24px; }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand">
        <span class="kicker">RAM Strategic Systems · Phase 1</span>
        <h1>RAM-OS Cockpit</h1>
      </div>
      <span class="built">Updated ${escapeHtml(builtAt)} ET</span>
    </header>

    <div class="banner ${inboxState}">
      <span class="dot"></span>
      ${escapeHtml(inboxMessage)}
    </div>

    <div class="stat-grid">
      ${pillarCard('Finance', finance)}
      ${pillarCard('Revenue / Ops', revenueOps)}
    </div>

    <div class="panel">
      <h2>Today</h2>
      ${taskList(today)}
    </div>

    <div class="panel">
      <h2>Backlog</h2>
      ${backlogSections || '<p class="empty">Nothing here.</p>'}
    </div>

    <footer>Rebuilds automatically on every push to the Life-OS repo.</footer>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'index.html'), html);
console.log('Dashboard built to site/dist/index.html');
