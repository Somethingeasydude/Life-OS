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
  G: { word: 'On track', color: '#2F6F4E' },
  Y: { word: 'Watch', color: '#B8860B' },
  R: { word: 'At risk', color: '#8B3A3A' },
};

function parsePillar(md) {
  const role = (md.match(/\*\*Role:\*\*\s*(.*)/) || [])[1] || '';
  const objective = (md.match(/\*\*Objective:\*\*\s*(.*)/) || [])[1] || '';
  const signal = (md.match(/\*\*Health signal:\*\*\s*(.*)/) || [])[1] || '';
  const rows = [...md.matchAll(/^\|(?!-{3,})(.+)\|$/gm)]
    .map((r) => r[1].split('|').map((c) => c.trim()))
    .filter((cols) => cols.length >= 3 && cols[0] !== 'Date' && (cols[0] || cols[1]));
  const last = rows.length ? rows[rows.length - 1] : null;
  const status = last ? STATUS[last[2]] : null;
  const history = rows
    .filter((r) => r[0])
    .slice(-4)
    .reverse();
  return {
    role,
    objective,
    signal,
    latest: last ? last[1] : 'No data yet',
    statusWord: status ? status.word : 'Not set',
    color: status ? status.color : '#7a7266',
    history,
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

const DEADLINES = [
  { label: 'Housing decision (mom + Ryan to leave)', date: '2026-08-24' },
  { label: 'Sept rent due', date: '2026-09-01' },
];

function daysUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function deadlineWidget() {
  const items = DEADLINES.map((d) => {
    const days = daysUntil(d.date);
    const urgent = days <= 3;
    const label = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`;
    return `<div class="deadline ${urgent ? 'urgent' : ''}">
      <span class="deadline-days">${label}</span>
      <span class="deadline-label">${escapeHtml(d.label)}</span>
    </div>`;
  }).join('');
  return `<div class="panel deadlines"><h2>Coming Up</h2><div class="deadline-row">${items}</div></div>`;
}

function historyList(history) {
  if (!history.length) return '';
  return `<div class="stat-history">
    ${history
      .map(
        (r) => `<div class="history-row"><span class="history-date">${escapeHtml(r[0] || '—')}</span><span class="history-text">${escapeHtml(r[1])}</span></div>`
      )
      .join('')}
  </div>`;
}

function pillarCard(name, p) {
  return `
    <div class="stat-card" style="--accent:${p.color}">
      <div class="stat-top">
        <span class="stat-name">${escapeHtml(name)}</span>
        <span class="pill" style="background:${p.color}1a;color:${p.color}">${escapeHtml(p.statusWord)}</span>
      </div>
      <p class="stat-value">${escapeHtml(p.latest)}</p>
      <p class="stat-label">${escapeHtml(p.signal)}</p>
      ${historyList(p.history)}
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Lato:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    color-scheme: light dark;
    --bg: #FAF8F4;
    --bg-elevated: #FFFFFF;
    --border: #E4DCC8;
    --text: #1C2B3A;
    --muted: #6b7688;
    --accent: #B8942A;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #1C2B3A;
      --bg-elevated: #243449;
      --border: #34455c;
      --text: #FAF8F4;
      --muted: #a9b6c4;
      --accent: #D4AF4B;
    }
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    margin: 0;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 880px; margin: 0 auto; padding: 32px 20px 80px; }

  header { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
  .brand { display: flex; flex-direction: column; }
  .brand .kicker { font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); font-weight: 700; margin-bottom: 4px; }
  h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 2.1rem; margin: 0; letter-spacing: 0.01em; }
  .built { color: var(--muted); font-size: 0.78rem; }

  .banner {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;
    font-size: 0.88rem; font-weight: 600;
    border: 1px solid transparent;
  }
  .banner.warn { background: #B8860B18; border-color: #B8860B40; color: #B8860B; }
  .banner.ok { background: #2F6F4E18; border-color: #2F6F4E40; color: #2F6F4E; }
  .banner .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 20px; }
  .stat-card {
    position: relative;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 20px 20px 18px;
    overflow: hidden;
  }
  .stat-card::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--accent);
  }
  .stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .stat-name { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.05rem; font-weight: 700; color: var(--text); letter-spacing: 0.02em; }
  .pill { font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.04em; }
  .stat-value { font-size: 1.05rem; font-weight: 600; margin: 0 0 2px; line-height: 1.4; }
  .stat-label { font-size: 0.75rem; color: var(--muted); margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.04em; }
  .stat-objective { font-size: 0.82rem; color: var(--muted); margin: 12px 0 0; padding-top: 12px; border-top: 1px solid var(--border); font-style: italic; }

  .stat-history { margin: 10px 0; padding: 10px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .history-row { display: flex; gap: 10px; font-size: 0.76rem; padding: 3px 0; color: var(--muted); }
  .history-row:first-child { color: var(--text); font-weight: 600; }
  .history-date { flex-shrink: 0; font-variant-numeric: tabular-nums; width: 74px; }
  .history-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .panel {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 20px 22px;
    margin-bottom: 16px;
  }
  .panel h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.2rem; font-weight: 700; margin: 0 0 14px; }
  .empty { color: var(--muted); font-size: 0.85rem; font-style: italic; margin: 0; }

  .deadline-row { display: flex; flex-wrap: wrap; gap: 12px; }
  .deadline {
    flex: 1; min-width: 180px;
    border: 1px solid var(--border); border-radius: 4px; padding: 10px 14px;
    display: flex; flex-direction: column; gap: 2px;
  }
  .deadline.urgent { border-color: #8B3A3A; background: #8B3A3A12; }
  .deadline-days { font-size: 1.3rem; font-weight: 700; font-family: 'Cormorant Garamond', Georgia, serif; }
  .deadline.urgent .deadline-days { color: #8B3A3A; }
  .deadline-label { font-size: 0.78rem; color: var(--muted); }

  ul.today-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  ul.today-list li {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.92rem; padding: 9px 12px; border-radius: 3px; background: var(--bg);
    border: 1px solid var(--border);
  }
  ul.today-list li .check {
    width: 18px; height: 18px; border-radius: 3px; border: 1px solid var(--muted);
    display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0;
    color: var(--accent); border-color: var(--accent);
  }
  ul.today-list li.done { color: var(--muted); text-decoration: line-through; }

  .backlog-group { padding: 14px 0; border-bottom: 1px solid var(--border); }
  .backlog-group:last-child { border-bottom: none; padding-bottom: 0; }
  .backlog-group:first-child { padding-top: 0; }
  .backlog-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .tag { font-size: 0.85rem; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.04em; }
  .count { font-size: 0.75rem; color: var(--muted); background: var(--bg); border: 1px solid var(--border); padding: 1px 9px; border-radius: 3px; }
  .backlog-group ul { margin: 0; padding-left: 18px; }
  .backlog-group li { font-size: 0.88rem; margin: 5px 0; }

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

    ${deadlineWidget()}

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
