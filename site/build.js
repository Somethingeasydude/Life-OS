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

function parsePillar(md) {
  const role = (md.match(/\*\*Role:\*\*\s*(.*)/) || [])[1] || '';
  const objective = (md.match(/\*\*Objective:\*\*\s*(.*)/) || [])[1] || '';
  const signal = (md.match(/\*\*Health signal:\*\*\s*(.*)/) || [])[1] || '';
  const rows = [...md.matchAll(/^\|(?!-{3,})(.+)\|$/gm)]
    .map((r) => r[1].split('|').map((c) => c.trim()))
    .filter((cols) => cols.length >= 3 && cols[0] !== 'Date');
  const last = rows.length ? rows[rows.length - 1] : null;
  const statusColor = { G: '#2e9e5b', Y: '#c9a227', R: '#c0392b' };
  return {
    role,
    objective,
    signal,
    latest: last ? last[1] : 'No data yet',
    color: last ? statusColor[last[2]] || '#888' : '#888',
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
    <div class="card">
      <div class="card-head">
        <span class="dot" style="background:${p.color}"></span>
        <h2>${escapeHtml(name)}</h2>
      </div>
      <p class="role">${escapeHtml(p.role)}</p>
      <p class="objective">${escapeHtml(p.objective)}</p>
      <p class="signal-label">${escapeHtml(p.signal)}</p>
      <p class="signal-value">${escapeHtml(p.latest)}</p>
    </div>`;
}

function taskList(items) {
  if (!items.length) return '<p class="empty">Nothing here.</p>';
  return `<ul>${items
    .map((t) => `<li class="${t.done ? 'done' : ''}">${escapeHtml(t.text)}</li>`)
    .join('')}</ul>`;
}

const backlogSections = Object.entries(backlog)
  .map(
    ([tag, items]) => `
    <div class="backlog-group">
      <h3>#${escapeHtml(tag)} <span class="count">${items.length}</span></h3>
      <ul>${items.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
    </div>`
  )
  .join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RAM-OS Cockpit</title>
<style>
  :root { color-scheme: light dark; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 760px;
    margin: 0 auto;
    padding: 24px 16px 64px;
    background: #f7f7f5;
    color: #1c1c1c;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #16171a; color: #e8e8e6; }
    .card, .backlog-group { background: #1f2023 !important; border-color: #33343a !important; }
  }
  h1 { font-size: 1.4rem; margin-bottom: 4px; }
  .updated { color: #888; font-size: 0.85rem; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .card { border: 1px solid #e2e2e0; border-radius: 10px; padding: 16px; background: #fff; }
  .card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .card h2 { font-size: 1.05rem; margin: 0; }
  .role { color: #888; font-size: 0.8rem; margin: 0 0 4px; }
  .objective { margin: 0 0 12px; font-size: 0.9rem; }
  .signal-label { color: #888; font-size: 0.75rem; margin: 0; text-transform: uppercase; letter-spacing: 0.03em; }
  .signal-value { margin: 2px 0 0; font-weight: 600; }
  section { margin-bottom: 32px; }
  section h2 { font-size: 1.1rem; border-bottom: 1px solid #e2e2e0; padding-bottom: 6px; }
  ul { padding-left: 20px; margin: 8px 0; }
  li.done { text-decoration: line-through; color: #888; }
  .empty { color: #888; font-style: italic; }
  .backlog-group { border: 1px solid #e2e2e0; border-radius: 10px; padding: 12px 16px; background: #fff; margin-bottom: 12px; }
  .backlog-group h3 { margin: 0 0 4px; font-size: 0.95rem; }
  .count { color: #888; font-weight: normal; }
  .inbox-flag { font-size: 0.9rem; color: ${inboxCount > 0 ? '#c9a227' : '#2e9e5b'}; }
</style>
</head>
<body>
  <h1>RAM-OS Cockpit</h1>
  <p class="updated">Built ${new Date().toISOString()}</p>

  <div class="grid">
    ${pillarCard('Finance', finance)}
    ${pillarCard('Revenue / Ops', revenueOps)}
  </div>

  <section>
    <h2>Today</h2>
    ${taskList(today)}
  </section>

  <section>
    <h2>Backlog</h2>
    ${backlogSections || '<p class="empty">Nothing here.</p>'}
  </section>

  <section>
    <h2>Inbox</h2>
    <p class="inbox-flag">${inboxCount} item${inboxCount === 1 ? '' : 's'} waiting to be clarified${inboxCount > 0 ? ' — clear it today' : ' — empty, good'}.</p>
  </section>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'index.html'), html);
console.log('Dashboard built to site/dist/index.html');
