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

// Escapes, then renders markdown **bold** as <strong> — the only markdown
// construct these files actually use.
function md(s) {
  return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// Splits a status-table cell into a short headline + supporting detail,
// e.g. "~0 weeks. Way2Go $4..." -> ("~0 weeks", "Way2Go $4...")
function splitHeadline(text) {
  const stripped = text.replace(/\*\*/g, '');
  const periodIdx = stripped.indexOf('. ');
  const dashIdx = stripped.indexOf(' — ');
  const candidates = [periodIdx, dashIdx].filter((i) => i > 0 && i < 60);
  if (!candidates.length) return { headline: text, detail: '' };
  const cut = Math.min(...candidates);
  const sep = stripped[cut] === '.' ? 2 : 3;
  return { headline: text.slice(0, cut).replace(/\*\*/g, ''), detail: text.slice(cut + sep) };
}

function parseChecklist(mdText, headingLine, stopAtNextHeading) {
  const lines = mdText.split('\n');
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

function parseBacklog(mdText) {
  const lines = mdText.split('\n');
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

function parsePillar(mdText) {
  const role = (mdText.match(/\*\*Role:\*\*\s*(.*)/) || [])[1] || '';
  const objective = (mdText.match(/\*\*Objective:\*\*\s*(.*)/) || [])[1] || '';
  const signal = (mdText.match(/\*\*Health signal:\*\*\s*(.*)/) || [])[1] || '';
  const rows = [...mdText.matchAll(/^\|(?!-{3,})(.+)\|$/gm)]
    .map((r) => r[1].split('|').map((c) => c.trim()))
    .filter((cols) => cols.length >= 3 && cols[0] !== 'Date' && (cols[0] || cols[1]));
  const last = rows.length ? rows[rows.length - 1] : null;
  const status = last ? STATUS[last[2]] : null;
  // Prior entries only -- the current one is already shown as headline+detail above.
  const history = rows
    .filter((r) => r[0])
    .slice(0, -1)
    .slice(-3)
    .reverse();
  const split = last ? splitHeadline(last[1]) : { headline: 'No data yet', detail: '' };
  return {
    role,
    objective,
    signal,
    headline: split.headline,
    detail: split.detail,
    statusWord: status ? status.word : 'Not set',
    color: status ? status.color : '#71717a',
    history,
  };
}

function countInboxItems(mdText) {
  return mdText
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

function dayLabel(days) {
  return days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`;
}

// Urgent deadlines (<=3 days) get a dominant full-width alert at the very
// top. Everything else stays a quiet one-line strip -- not a card, so it
// doesn't compete visually with the pillars, which are the actual point.
function deadlineSection() {
  const parsed = DEADLINES.map((d) => ({ ...d, days: daysUntil(d.date) }));
  const urgent = parsed.filter((d) => d.days <= 3);
  const quiet = parsed.filter((d) => d.days > 3);

  const alert = urgent.length
    ? `<section class="alert-zone">
        ${urgent
          .map(
            (d) => `<div class="alert-banner">
              <span class="alert-days">${dayLabel(d.days)}</span>
              <span class="alert-label">${md(d.label)}</span>
            </div>`
          )
          .join('')}
      </section>`
    : '';

  const quietStrip = quiet.length
    ? `<div class="quiet-deadlines">${quiet
        .map((d) => `<span class="quiet-item"><strong>${dayLabel(d.days)}</strong> ${md(d.label)}</span>`)
        .join('<span class="quiet-sep">·</span>')}</div>`
    : '';

  return alert + quietStrip;
}

function historyList(history) {
  if (!history.length) return '';
  return `<div class="stat-history">
    ${history
      .map(
        (r) => `<div class="history-row"><span class="history-date">${md(r[0] || '—')}</span><span class="history-text">${md(r[1])}</span></div>`
      )
      .join('')}
  </div>`;
}

function pillarCard(name, p) {
  return `
    <div class="stat-card" style="--accent:${p.color}">
      <div class="stat-top">
        <span class="stat-name">${md(name)}</span>
        <span class="pill" style="background:${p.color}1a;color:${p.color}">${md(p.statusWord)}</span>
      </div>
      <p class="stat-label">${md(p.signal)}</p>
      <p class="stat-value">${md(p.headline)}</p>
      ${p.detail ? `<p class="stat-detail">${md(p.detail)}</p>` : ''}
      ${historyList(p.history)}
      <p class="stat-objective">${md(p.objective)}</p>
    </div>`;
}

function taskList(items) {
  if (!items.length) return '<p class="empty">Today list is empty — pull up to 3 from the backlog.</p>';
  return `<ul class="today-list">${items
    .map(
      (t) =>
        `<li class="${t.done ? 'done' : ''}"><span class="check">${t.done ? '✓' : ''}</span>${md(t.text)}</li>`
    )
    .join('')}</ul>`;
}

const backlogSections = Object.entries(backlog)
  .map(
    ([tag, items]) => `
    <div class="backlog-group">
      <div class="backlog-head">
        <span class="tag">#${md(tag)}</span>
        <span class="count">${items.length}</span>
      </div>
      ${items.length ? `<ul>${items.map((t) => `<li>${md(t)}</li>`).join('')}</ul>` : '<p class="empty">Empty.</p>'}
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
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    color-scheme: dark;
    --bg: #0a0a0f;
    --bg-elevated: #16161d;
    --border: #26262f;
    --text: #ffffff;
    --muted: #9ca3af;
    --faint: #6b7280;
    --accent: #4f46e5;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    margin: 0;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    background-image: radial-gradient(var(--border) 1px, transparent 1px);
    background-size: 24px 24px;
    line-height: 1.5;
  }
  strong { color: var(--text); font-weight: 700; }
  .wrap { max-width: 900px; margin: 0 auto; padding: 40px 24px 96px; }

  header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 28px; }
  .brand { display: flex; flex-direction: column; }
  .brand .kicker {
    display: inline-flex; align-items: center; gap: 7px; width: fit-content;
    font-size: 0.72rem; letter-spacing: 0.06em; color: var(--accent); font-weight: 600;
    margin-bottom: 14px; background: #4f46e51a; border: 1px solid #4f46e540;
    padding: 5px 13px 5px 11px; border-radius: 999px;
  }
  .brand .kicker::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
  h1 { font-family: 'Sora', -apple-system, sans-serif; font-weight: 700; font-size: 2rem; margin: 0; letter-spacing: -0.02em; }
  .built { color: var(--faint); font-size: 0.78rem; padding-top: 4px; white-space: nowrap; }

  .banner {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 18px; border-radius: 12px; margin-bottom: 28px;
    font-size: 0.88rem; font-weight: 500;
    border: 1px solid transparent;
  }
  .banner.warn { background: #eab30814; border-color: #eab30838; color: #eab308; }
  .banner.ok { background: #22c55e14; border-color: #22c55e38; color: #22c55e; }
  .banner .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

  section { margin-bottom: 20px; }
  section:last-of-type { margin-bottom: 0; }

  .deadline-row { display: flex; flex-wrap: wrap; gap: 12px; }
  .deadline {
    flex: 1; min-width: 190px;
    border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 3px; background: var(--bg);
  }
  .deadline.urgent { border-color: #ef444460; background: #ef444412; }
  .deadline-days { font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 700; font-variant-numeric: proportional-nums; }
  .deadline.urgent .deadline-days { color: #ef4444; }
  .deadline-label { font-size: 0.78rem; color: var(--muted); }

  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
  .stat-card {
    position: relative;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 24px 24px 20px;
    overflow: hidden;
  }
  .stat-card::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--accent);
  }
  .stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .stat-name { font-family: 'Sora', sans-serif; font-size: 1.05rem; font-weight: 700; color: var(--text); }
  .pill { font-size: 0.68rem; font-weight: 700; padding: 4px 11px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.03em; }
  .stat-label { font-size: 0.72rem; color: var(--faint); margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .stat-value { font-family: 'Sora', sans-serif; font-size: 2.3rem; font-weight: 700; font-variant-numeric: proportional-nums; margin: 0; line-height: 1.15; letter-spacing: -0.01em; }
  .stat-detail { font-size: 0.88rem; color: var(--muted); margin: 10px 0 0; line-height: 1.6; }

  .stat-history { margin: 18px 0 0; padding: 16px 0 0; border-top: 1px solid var(--border); }
  .history-row { display: flex; gap: 14px; font-size: 0.78rem; padding: 3px 0; color: var(--faint); }
  .history-date { flex-shrink: 0; font-variant-numeric: tabular-nums; width: 82px; }
  .history-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .stat-objective { font-size: 0.82rem; color: var(--faint); margin: 16px 0 0; padding-top: 16px; border-top: 1px solid var(--border); }

  .alert-zone { margin-bottom: 16px; }
  .alert-banner {
    display: flex; align-items: baseline; gap: 14px;
    background: #ef444414; border: 1px solid #ef444460; border-radius: 14px;
    padding: 16px 20px; margin-bottom: 10px;
  }
  .alert-days { font-family: 'Sora', sans-serif; font-size: 1.6rem; font-weight: 800; color: #ef4444; flex-shrink: 0; }
  .alert-label { font-size: 0.92rem; color: var(--text); font-weight: 500; }

  .quiet-deadlines {
    font-size: 0.78rem; color: var(--faint); margin-bottom: 24px;
    display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
  }
  .quiet-deadlines strong { color: var(--muted); font-weight: 700; }
  .quiet-sep { color: var(--border); }

  .panel {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 18px 22px;
  }
  .panel h2 { font-family: 'Sora', sans-serif; font-size: 0.85rem; font-weight: 700; margin: 0 0 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .empty { color: var(--faint); font-size: 0.85rem; font-style: italic; margin: 0; }

  ul.today-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  ul.today-list li {
    display: flex; align-items: center; gap: 11px;
    font-size: 0.92rem; padding: 11px 14px; border-radius: 10px; background: var(--bg);
    border: 1px solid var(--border);
  }
  ul.today-list li .check {
    width: 18px; height: 18px; border-radius: 6px; border: 1px solid var(--muted);
    display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0;
    color: var(--accent); border-color: var(--accent);
  }
  ul.today-list li.done { color: var(--faint); text-decoration: line-through; }

  .backlog-group { padding: 16px 0; border-bottom: 1px solid var(--border); }
  .backlog-group:last-child { border-bottom: none; padding-bottom: 0; }
  .backlog-group:first-child { padding-top: 0; }
  .backlog-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .tag { font-size: 0.83rem; font-weight: 700; font-family: 'Sora', sans-serif; color: var(--accent); }
  .count { font-size: 0.72rem; color: var(--faint); background: var(--bg); border: 1px solid var(--border); padding: 1px 9px; border-radius: 999px; font-variant-numeric: proportional-nums; }
  .backlog-group ul { margin: 0; padding-left: 20px; }
  .backlog-group li { font-size: 0.84rem; margin: 6px 0; color: var(--faint); line-height: 1.5; }

  footer { text-align: center; color: var(--faint); font-size: 0.75rem; margin-top: 40px; }
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

    ${deadlineSection()}

    <div class="banner ${inboxState}">
      <span class="dot"></span>
      ${md(inboxMessage)}
    </div>

    <section class="stat-grid">
      ${pillarCard('Finance', finance)}
      ${pillarCard('Revenue / Ops', revenueOps)}
    </section>

    <section class="panel">
      <h2>Today</h2>
      ${taskList(today)}
    </section>

    <section class="panel">
      <h2>Backlog</h2>
      ${backlogSections || '<p class="empty">Nothing here.</p>'}
    </section>

    <footer>Rebuilds automatically on every push to the Life-OS repo.</footer>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'index.html'), html);
console.log('Dashboard built to site/dist/index.html');
