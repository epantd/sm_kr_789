'use strict';

/* ==========================================================
   САМОСТОЯТЕЛЬНАЯ РАБОТА 9 КЛАСС
   4 (БД+Диаграмма) + 4 + 2 + 2 = 12 заданий
   ========================================================== */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyF2x-qnIPerEebab8j4PXEr_U7csUGruQROCLgsKYGRUgeBvMjiHnBSEfpGhE881Wk/exec';
const WORK_ID = '9-3sm';
const TOTAL_TASKS = 12;

/* ---------------------- УТИЛИТЫ ---------------------- */

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ==========================================================
   БЛОК 1: БАЗА ДАННЫХ (интерактив как в LibreOffice Calc)
   ========================================================== */

const SURNAMES = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Фёдоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семёнов'];
const CITIES = ['Москва', 'Казань', 'Сочи'];
const GENDERS = ['М', 'Ж'];
const GRADES = [3, 4, 5];

const DB_COLUMNS = [
  { key: 'name',   label: 'Фамилия' },
  { key: 'city',   label: 'Город' },
  { key: 'gender', label: 'Пол' },
  { key: 'math',   label: 'Математика' },
  { key: 'rus',    label: 'Русский' },
  { key: 'eng',    label: 'Английский' }
];

// Конфигурация 4 заданий: 3 вопроса с фильтрами
const DB_TASK_CONFIGS = [
  [
    { text: 'Из Москвы получили «5» по математике', fn: s => s.city === 'Москва' && s.math === 5 },
    { text: 'Девочки получили «4» или «5» по русскому', fn: s => s.gender === 'Ж' && s.rus >= 4 },
    { text: 'Из Казани получили «4» или «5» по английскому', fn: s => s.city === 'Казань' && s.eng >= 4 }
  ],
  [
    { text: 'Мальчики из Сочи получили «5» по русскому', fn: s => s.city === 'Сочи' && s.gender === 'М' && s.rus === 5 },
    { text: 'Девочки получили «5» по английскому', fn: s => s.gender === 'Ж' && s.eng === 5 },
    { text: 'Ученики с «4» и «5» по всем трём предметам', fn: s => s.math >= 4 && s.rus >= 4 && s.eng >= 4 }
  ],
  [
    { text: 'Из Казани получили «4» по математике', fn: s => s.city === 'Казань' && s.math === 4 },
    { text: 'Девочки из Москвы получили «3» по русскому', fn: s => s.city === 'Москва' && s.gender === 'Ж' && s.rus === 3 },
    { text: 'Мальчики получили «5» по математике', fn: s => s.gender === 'М' && s.math === 5 }
  ],
  [
    { text: 'Из Москвы получили «4» по математике', fn: s => s.city === 'Москва' && s.math === 4 },
    { text: 'Девочки получили «5» и по русскому, и по английскому', fn: s => s.gender === 'Ж' && s.rus === 5 && s.eng === 5 },
    { text: 'Из Сочи получили «5» по всем трём предметам', fn: s => s.city === 'Сочи' && s.math === 5 && s.rus === 5 && s.eng === 5 }
  ]
];

function generateStudents() {
  const names = shuffle([...SURNAMES]).slice(0, 10);
  return names.map(name => ({
    name,
    city: pick(CITIES),
    gender: pick(GENDERS),
    math: pick(GRADES),
    rus: pick(GRADES),
    eng: pick(GRADES)
  }));
}

function generateDBTask(taskIndex) {
  const config = DB_TASK_CONFIGS[taskIndex];
  let students, values;
  for (let attempt = 0; attempt < 300; attempt++) {
    students = generateStudents();
    values = config.map(cfg => students.filter(cfg.fn).length);
    if (values.some(v => v < 1 || v > 6)) continue;
    if (values[0] === values[1] || values[1] === values[2] || values[0] === values[2]) continue;
    break;
  }
  if (!students) {
    students = generateStudents();
    values = config.map(cfg => students.filter(cfg.fn).length);
  }
  return {
    type: 'db_chart',
    students,
    subQuestions: config.map((c, i) => ({ text: c.text, correct: String(values[i]) }))
  };
}

/* ---------- Рендер БД-задания ---------- */

function renderDBTaskHTML(task) {
  let html = '';

  // Панель над таблицей
  html += '<div class="data-toolbar">';
  html += '<span class="data-toolbar-label">Таблица данных</span>';
  html += '<button type="button" class="toolbar-btn" data-action="filter">🫙 Фильтр</button>';
  html += '</div>';

  // Таблица
  html += '<div class="table-wrap"><table class="data-table" id="dbTable"><thead><tr>';
  DB_COLUMNS.forEach(col => {
    html += `<th class="header-cell" data-col="${col.key}">
               <div class="th-inner"><span>${col.label}</span></div>
             </th>`;
  });
  html += '</tr></thead><tbody></tbody></table></div>';
  html += '<p class="table-info" id="dbTableInfo"></p>';

  // Вопросы и мини-таблица
  html += '<p class="task-instruction" style="margin-top:16px;">Подсчитайте с помощью фильтров и впишите значения:</p>';
  html += '<table class="mini-table" id="dbMiniTable"><thead><tr><th>№</th><th>Вопрос</th><th>Ответ</th></tr></thead><tbody>';
  task.subQuestions.forEach((q, i) => {
    html += `<tr>
               <td>${i + 1}</td>
               <td style="text-align:left">${escapeHtml(q.text)}</td>
               <td><input type="text" inputmode="numeric" class="table-input" data-qidx="${i}" placeholder="?" maxlength="2"></td>
             </tr>`;
  });
  html += '</tbody></table>';

  // Панель диаграммы
  html += `<div class="mini-toolbar">
             <div class="menu-wrapper">
               <button type="button" class="toolbar-btn" id="insertMenuBtn">Вставка ▾</button>
               <div class="dropdown-menu" id="insertMenu" hidden>
                 <button type="button" class="dropdown-item" id="insertChartItem">📊 Диаграмма...</button>
               </div>
             </div>
             <span class="table-select-status" id="selStatus" style="font-size:13px;color:var(--muted);">○ Мини-таблица не выделена</span>
           </div>`;

  html += '<div id="dbChartContainer"></div>';

  return html;
}

/* ---------- Логика БД-задания (замыкание) ---------- */

function attachDBEvents(task, ansObj) {
  const taskIndex = state.index;
  const students = task.students;

  // Состояние фильтров (локальное)
  const stateFilters = {};
  const selectedHeaders = new Set();
  const filterHeaders = new Set();
  let sortCol = null, sortDir = 'asc';
  let miniTableSelected = false;
  let chartBuilt = false;
  let chartType = null;

  const tableEl = document.getElementById('dbTable');
  const tbody = tableEl.querySelector('tbody');
  const infoEl = document.getElementById('dbTableInfo');
  const miniTableEl = document.getElementById('dbMiniTable');
  const selStatus = document.getElementById('selStatus');
  const chartContainer = document.getElementById('dbChartContainer');

  // Отрисовка строк
  function renderRows() {
    let data = [...students];
    for (const col in stateFilters) {
      const v = stateFilters[col];
      if (v && v !== 'all') data = data.filter(r => String(r[col]) === String(v));
    }
    if (sortCol) {
      data.sort((a, b) => {
        const va = a[sortCol], vb = b[sortCol];
        if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        return sortDir === 'asc' ? va - vb : vb - va;
      });
    }
    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${DB_COLUMNS.length}" style="color:var(--muted);padding:14px;">Нет строк по фильтру</td></tr>`;
    } else {
      data.forEach(s => {
        const tr = document.createElement('tr');
        DB_COLUMNS.forEach(col => {
          const td = document.createElement('td');
          td.textContent = s[col.key];
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }
    infoEl.textContent = `Показано строк: ${data.length}`;
  }

  // Перестройка шапки при изменении фильтров
  function renderHeader() {
    tableEl.querySelectorAll('th.header-cell').forEach(th => {
      const col = th.dataset.col;
      th.classList.toggle('selected-header', selectedHeaders.has(col));

      const thInner = th.querySelector('.th-inner');
      // Удаляем старые элементы фильтра
      thInner.querySelectorAll('.filter-select, .sort-btn').forEach(x => x.remove());

      // Кнопка сортировки
      let icon = '↕';
      if (sortCol === col) icon = sortDir === 'asc' ? '↑' : '↓';
      const sortBtn = document.createElement('button');
      sortBtn.type = 'button';
      sortBtn.className = 'sort-btn';
      sortBtn.style.cssText = 'background:none;border:none;cursor:pointer;color:var(--accent);font-size:14px;padding:0 2px;';
      sortBtn.textContent = icon;
      sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        else { sortCol = col; sortDir = 'asc'; }
        renderHeader();
        renderRows();
      });
      thInner.appendChild(sortBtn);

      // Выпадающий фильтр
      if (filterHeaders.has(col)) {
        const uniq = [...new Set(students.map(s => s[col]))].sort();
        const sel = document.createElement('select');
        sel.className = 'filter-select';
        sel.style.cssText = 'font-family:inherit;font-size:11px;padding:2px 4px;border-radius:4px;border:1px solid var(--border);background:#fff;max-width:90px;cursor:pointer;';
        sel.innerHTML = `<option value="all">Все</option>` +
          uniq.map(v => `<option value="${v}">${v}</option>`).join('');
        if (stateFilters[col]) sel.value = stateFilters[col];
        sel.addEventListener('click', e => e.stopPropagation());
        sel.addEventListener('change', () => {
          if (sel.value === 'all') delete stateFilters[col];
          else stateFilters[col] = sel.value;
          renderRows();
        });
        thInner.appendChild(sel);
      }
    });
  }

  // Клик по заголовку — выделение
  tableEl.querySelectorAll('th.header-cell').forEach(th => {
    th.addEventListener('click', (e) => {
      if (e.target.closest('.sort-btn') || e.target.closest('.filter-select')) return;
      const col = th.dataset.col;
      if (selectedHeaders.has(col)) selectedHeaders.delete(col);
      else selectedHeaders.add(col);
      renderHeader();
    });
  });

  // Кнопка «Фильтр»
  document.querySelector('[data-action="filter"]').addEventListener('click', () => {
    if (selectedHeaders.size === 0) {
      if (filterHeaders.size > 0) {
        filterHeaders.clear();
        for (const k in stateFilters) delete stateFilters[k];
        renderHeader();
        renderRows();
      } else {
        alert('Сначала выделите заголовки столбцов (кликните по ним), затем нажмите «Фильтр».');
      }
    } else {
      selectedHeaders.forEach(h => filterHeaders.add(h));
      selectedHeaders.clear();
      renderHeader();
      renderRows();
    }
  });

  // Мини-таблица: клик — выделение
  miniTableEl.addEventListener('click', (e) => {
    if (e.target.tagName === 'INPUT') return;
    miniTableSelected = true;
    miniTableEl.classList.add('selected');
    selStatus.textContent = '✓ Мини-таблица выделена';
    selStatus.style.color = 'var(--green)';
  });
  miniTableEl.querySelectorAll('.table-input').forEach(inp => {
    inp.addEventListener('focus', () => {
      miniTableSelected = true;
      miniTableEl.classList.add('selected');
      selStatus.textContent = '✓ Мини-таблица выделена';
      selStatus.style.color = 'var(--green)';
    });
  });

  // Меню «Вставка»
  const menuBtn = document.getElementById('insertMenuBtn');
  const menu = document.getElementById('insertMenu');
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
  });
  document.getElementById('insertChartItem').addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = true;

    if (!miniTableSelected) {
      alert('Сначала выделите мини-таблицу (кликните по ней).');
      return;
    }

    // Проверяем, что все 3 значения введены
    const inputs = miniTableEl.querySelectorAll('.table-input');
    const vals = [];
    let allFilled = true;
    inputs.forEach(inp => {
      const v = inp.value.trim();
      if (!v) allFilled = false;
      vals.push(v);
    });
    if (!allFilled) {
      alert('Сначала заполните все три ячейки ответов, затем постройте диаграмму.');
      return;
    }

    openChartWizard({
      values: vals.map(v => parseInt(v, 10) || 0),
      onInsert: (type) => {
        chartType = type;
        chartBuilt = true;
        if (type === 'pie') {
          chartContainer.innerHTML = buildPieHTML(vals.map(v => parseInt(v, 10) || 0));
        } else {
          chartContainer.innerHTML = `<p style="text-align:center;color:var(--muted);">Выбрана диаграмма типа «${type}». Для задания нужна круговая.</p>`;
        }
        // Сохраняем ответ
        ansObj.chartBuilt = true;
        ansObj.chartType = type;
      }
    });
  });

  // Клик вне меню — закрыть
  document.addEventListener('click', () => { menu.hidden = true; }, { once: true });

  // Первичная отрисовка
  renderHeader();
  renderRows();
}

/* ---------- Мастер диаграмм ---------- */

function openChartWizard({ values, onInsert }) {
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `
    <div class="modal-content">
      <button type="button" class="modal-close" id="cwClose">&times;</button>
      <h2 style="margin:0 0 14px;font-size:20px;">Мастер диаграмм</h2>
      <p style="font-size:13px;color:var(--muted);margin:0 0 12px;">Выберите тип диаграммы:</p>
      <div class="chart-type-options">
        <label class="chart-type-option"><input type="radio" name="ct" value="bar"><span>📊 Столбчатая</span></label>
        <label class="chart-type-option"><input type="radio" name="ct" value="pie" checked><span>🥧 Круговая</span></label>
        <label class="chart-type-option"><input type="radio" name="ct" value="line"><span>📈 Линейная</span></label>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button type="button" class="btn" style="background:#fff;color:var(--accent-dark);border:1px solid #c7d5f0;padding:10px 18px;" id="cwCancel">Отмена</button>
        <button type="button" class="btn btn-primary" style="padding:10px 18px;" id="cwOk">Готово</button>
      </div>
    </div>`;
  document.body.appendChild(ov);

  const updateActive = () => {
    ov.querySelectorAll('.chart-type-option').forEach(l => l.classList.remove('active'));
    const checked = ov.querySelector('input[name="ct"]:checked');
    if (checked) checked.closest('.chart-type-option').classList.add('active');
  };
  updateActive();
  ov.querySelectorAll('input[name="ct"]').forEach(r => r.addEventListener('change', updateActive));

  const close = () => { ov.remove(); };
  ov.querySelector('#cwClose').addEventListener('click', close);
  ov.querySelector('#cwCancel').addEventListener('click', close);
  ov.querySelector('#cwOk').addEventListener('click', () => {
    const type = ov.querySelector('input[name="ct"]:checked').value;
    close();
    onInsert(type);
  });
}

function buildPieHTML(vals) {
  const total = vals.reduce((a, b) => a + b, 0);
  if (total === 0) return '<p style="text-align:center;color:var(--muted)">Нет данных</p>';
  const colors = ['#4f6ef7', '#16a34a', '#f59e0b'];
  const labels = ['Вопрос 1', 'Вопрос 2', 'Вопрос 3'];
  let acc = 0;
  const parts = [];
  const legend = [];
  vals.forEach((v, i) => {
    const pct = (v / total) * 100;
    parts.push(`${colors[i]} ${acc}% ${acc + pct}%`);
    acc += pct;
    legend.push(`<span><i style="background:${colors[i]}"></i>${labels[i]}: ${v}</span>`);
  });
  const gradient = `conic-gradient(${parts.join(', ')})`;
  return `
    <div class="chart-container">
      <div class="pie-chart" style="background:${gradient}"></div>
      <div class="chart-legend">${legend.join('')}</div>
    </div>`;
}

/* ==========================================================
   БЛОК 2–4: ГРАФЫ (не менялись)
   ========================================================== */

const NODES = {
  A: { x: 80,  y: 200 }, B: { x: 180, y: 100 }, C: { x: 200, y: 300 },
  E: { x: 300, y: 200 }, D: { x: 320, y: 120 }, F: { x: 340, y: 280 },
  G: { x: 440, y: 200 }
};

const POSSIBLE_EDGES = [
  ['A', 'B'], ['A', 'C'], ['A', 'E'], ['B', 'D'], ['B', 'E'],
  ['C', 'E'], ['C', 'F'], ['D', 'G'], ['E', 'D'], ['E', 'F'], ['E', 'G'], ['F', 'G']
];

function countPaths(edges, start, end) {
  if (start === end) return 1;
  const dp = {};
  for (let node in NODES) dp[node] = 0;
  dp[start] = 1;
  const sortedNodes = Object.keys(NODES).sort((a, b) => NODES[a].x - NODES[b].x);
  sortedNodes.forEach(u => {
    edges.forEach(([from, to]) => {
      if (from === u) dp[to] += dp[u];
    });
  });
  return dp[end];
}

function getIntermediateNodes(edges, start, end) {
  const valid = [];
  const all = Object.keys(NODES).filter(n => n !== start && n !== end);
  all.forEach(node => {
    if (countPaths(edges, start, node) > 0 && countPaths(edges, node, end) > 0) valid.push(node);
  });
  return valid;
}

function generateRandomEdges(targetMin, targetMax) {
  let bestEdges = null, bestDiff = Infinity;
  const target = (targetMin + targetMax) / 2;
  for (let attempt = 0; attempt < 300; attempt++) {
    const edges = [];
    POSSIBLE_EDGES.forEach(([u, v]) => { if (Math.random() < 0.55) edges.push([u, v]); });
    let valid = true;
    for (const node of Object.keys(NODES)) {
      if (node === 'A' || node === 'G') continue;
      if (!edges.some(([u, v]) => v === node) || !edges.some(([u, v]) => u === node)) { valid = false; break; }
    }
    if (!valid) continue;
    const paths = countPaths(edges, 'A', 'G');
    if (paths >= targetMin && paths <= targetMax) return edges;
    if (paths > 0) {
      const diff = Math.abs(paths - target);
      if (diff < bestDiff) { bestDiff = diff; bestEdges = edges; }
    }
  }
  return bestEdges || POSSIBLE_EDGES.slice();
}

function renderGraphToSVG(edges) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 520 400');
  svg.setAttribute('class', 'graph-svg');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#b45309" /></marker>`;
  svg.appendChild(defs);
  edges.forEach(([u, v]) => {
    const p1 = NODES[u], p2 = NODES[v];
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len, uy = dy / len;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x + ux * 6);
    line.setAttribute('y1', p1.y + uy * 6);
    line.setAttribute('x2', p2.x - ux * 14);
    line.setAttribute('y2', p2.y - uy * 14);
    line.setAttribute('stroke', '#b45309');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrow)');
    svg.appendChild(line);
  });
  for (const [label, pos] of Object.entries(NODES)) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pos.x); circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', '4'); circle.setAttribute('fill', '#b45309');
    g.appendChild(circle);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', pos.x); text.setAttribute('y', pos.y - 10);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('font-size', '16'); text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#1e293b'); text.textContent = label;
    g.appendChild(text); svg.appendChild(g);
  }
  return svg;
}

/* ==========================================================
   ГЕНЕРАЦИЯ ВСЕХ ЗАДАНИЙ
   ========================================================== */

function generateTasks() {
  const tasks = [];
  let lastAnswer = null;

  for (let i = 0; i < 4; i++) tasks.push(generateDBTask(i));

  for (let i = 0; i < 4; i++) {
    let edges, paths;
    do {
      edges = generateRandomEdges(4, 25);
      paths = countPaths(edges, 'A', 'G');
    } while (paths === lastAnswer);
    lastAnswer = paths;
    tasks.push({
      type: 'graph',
      instruction: 'На рисунке — схема дорог. По каждой дороге можно двигаться только в одном направлении (по стрелке).\nСколько существует различных путей из города A в город G?',
      graphEdges: edges, correct: String(paths)
    });
  }

  for (let i = 0; i < 2; i++) {
    let edges, paths, targetNode;
    do {
      edges = generateRandomEdges(4, 25);
      const inter = getIntermediateNodes(edges, 'A', 'G');
      if (!inter.length) continue;
      targetNode = pick(inter);
      const total = countPaths(edges, 'A', 'G');
      const through = countPaths(edges, 'A', targetNode) * countPaths(edges, targetNode, 'G');
      paths = total - through;
    } while (paths === lastAnswer || paths <= 0);
    lastAnswer = paths;
    tasks.push({
      type: 'graph',
      instruction: `На рисунке — схема дорог.\nСколько существует различных путей из города A в город G, **не проходящих** через город ${targetNode}?`,
      graphEdges: edges, correct: String(paths)
    });
  }

  for (let i = 0; i < 2; i++) {
    let edges, paths, targetNode;
    do {
      edges = generateRandomEdges(4, 25);
      const inter = getIntermediateNodes(edges, 'A', 'G');
      if (!inter.length) continue;
      targetNode = pick(inter);
      paths = countPaths(edges, 'A', targetNode) * countPaths(edges, targetNode, 'G');
    } while (paths === lastAnswer || paths <= 0);
    lastAnswer = paths;
    tasks.push({
      type: 'graph',
      instruction: `На рисунке — схема дорог.\nСколько существует различных путей из города A в город G, **проходящих** через город ${targetNode}?`,
      graphEdges: edges, correct: String(paths)
    });
  }

  return tasks;
}

/* ==========================================================
   СОСТОЯНИЕ И DOM
   ========================================================== */

const state = {
  student: { lastName: '', firstName: '', grade: '', letter: '' },
  tasks: [],
  index: 0,
  answers: [],
  scores: [],
  warnedSkip: false
};

const el = {
  screenStart: document.getElementById('screen-start'),
  screenQuiz:  document.getElementById('screen-quiz'),
  screenDone:  document.getElementById('screen-done'),
  startForm:   document.getElementById('startForm'),
  lastName:    document.getElementById('lastName'),
  firstName:   document.getElementById('firstName'),
  grade:       document.getElementById('grade'),
  letter:      document.getElementById('letter'),
  taskCard:    document.getElementById('taskCard'),
  progressText: document.getElementById('progressText'),
  progressFill: document.getElementById('progressFill'),
  finishEmoji: document.getElementById('finishEmoji'),
  finishTitle: document.getElementById('finishTitle'),
  finishText:  document.getElementById('finishText')
};

/* ==========================================================
   СТАРТ
   ========================================================== */

el.startForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const ln = el.lastName.value.trim();
  const fn = el.firstName.value.trim();
  const gr = el.grade.value.trim();
  const lt = el.letter.value.trim();
  if (!ln || !fn || !gr || !lt) { alert('Заполните все поля.'); return; }

  state.student = { lastName: ln, firstName: fn, grade: gr, letter: lt };
  state.tasks = generateTasks();
  state.index = 0;
  state.answers = [];
  state.scores = [];
  state.warnedSkip = false;

  el.screenStart.hidden = true;
  el.screenQuiz.hidden = false;
  renderTask();
});

/* ==========================================================
   РЕНДЕР
   ========================================================== */

function renderTask() {
  const task = state.tasks[state.index];
  state.warnedSkip = false;

  el.progressText.textContent = `Задание ${state.index + 1} из ${state.tasks.length}`;
  el.progressFill.style.width = `${(state.index / state.tasks.length) * 100}%`;

  if (task.type === 'db_chart') {
    state.answers[state.index] = {
      values: ['', '', ''],
      chartBuilt: false,
      chartType: null
    };
    let html = `<p class="task-topic">Задание ${state.index + 1} · База данных</p>`;
    html += `<p class="task-instruction">Выделите заголовки нужных столбцов, нажмите «Фильтр» справа сверху, настройте фильтры, подсчитайте строки. Заполните мини-таблицу, выделите её, постройте круговую диаграмму через «Вставка → Диаграмма».</p>`;
    html += renderDBTaskHTML(task);
    html += '<div class="feedback" id="feedback"></div>';
    html += `<div class="actions"><button type="button" class="btn btn-primary" id="nextBtn">${state.index === state.tasks.length - 1 ? 'Завершить и отправить' : 'Далее →'}</button></div>`;
    el.taskCard.innerHTML = html;

    // Связываем поля ввода ответов с state
    document.querySelectorAll('.table-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = +inp.dataset.qidx;
        state.answers[state.index].values[i] = inp.value.trim();
      });
    });

    attachDBEvents(task, state.answers[state.index]);
  } else {
    // graph
    state.answers[state.index] = '';
    let html = `<p class="task-topic">Задание ${state.index + 1} · Графы</p>`;
    html += `<p class="task-instruction">${escapeHtml(task.instruction).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</p>`;
    html += `<div class="graph-container" id="graph-container"></div>`;
    html += `<div class="input-wrap"><input type="text" inputmode="numeric" id="inputAnswer" class="input-answer" placeholder="Ответ" autocomplete="off"></div>`;
    html += '<div class="feedback" id="feedback"></div>';
    html += `<div class="actions"><button type="button" class="btn btn-primary" id="nextBtn">${state.index === state.tasks.length - 1 ? 'Завершить и отправить' : 'Далее →'}</button></div>`;
    el.taskCard.innerHTML = html;

    document.getElementById('graph-container').appendChild(renderGraphToSVG(task.graphEdges));
    const inp = document.getElementById('inputAnswer');
    inp.addEventListener('input', () => { state.answers[state.index] = inp.value.trim(); });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('nextBtn').click(); }
    });
    setTimeout(() => inp.focus(), 100);
  }

  document.getElementById('nextBtn').addEventListener('click', onNext);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================
   ПЕРЕХОД / ОЦЕНКА
   ========================================================== */

function onNext() {
  const task = state.tasks[state.index];
  const ans = state.answers[state.index];

  if (isEmpty(task, ans)) {
    if (!state.warnedSkip) {
      state.warnedSkip = true;
      const fb = document.getElementById('feedback');
      if (fb) fb.textContent = 'Вы не заполнили ответ полностью. Нажмите «Далее» ещё раз, чтобы пропустить без балла.';
      return;
    }
    state.scores[state.index] = 0;
  } else {
    state.scores[state.index] = isCorrect(task, ans) ? 1 : 0;
  }

  if (state.index < state.tasks.length - 1) {
    state.index++;
    renderTask();
  } else {
    submitResults();
  }
}

function isEmpty(task, ans) {
  if (task.type === 'db_chart') {
    if (!ans) return true;
    if (ans.values.some(v => !String(v).trim())) return true;
    if (!ans.chartBuilt) return true;
    return false;
  }
  if (task.type === 'graph') return !ans || !String(ans).trim();
  return true;
}

function isCorrect(task, ans) {
  if (task.type === 'db_chart') {
    const valsOk = task.subQuestions.every((q, i) =>
      String(ans.values[i]).trim() === q.correct
    );
    // Обязательно круговая диаграмма
    return valsOk && ans.chartBuilt && ans.chartType === 'pie';
  }
  if (task.type === 'graph') {
    return String(ans).trim().replace(/\s/g, '') === task.correct;
  }
  return false;
}

/* ==========================================================
   ОТПРАВКА
   ========================================================== */

function submitResults() {
  el.progressFill.style.width = '100%';
  el.progressText.textContent = 'Отправка…';

  const total = state.scores.reduce((a, b) => a + b, 0);
  const now = new Date();
  const dateStr = now.toLocaleString('ru-RU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });

  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      work: WORK_ID,
      lastName: state.student.lastName,
      firstName: state.student.firstName,
      grade: state.student.grade,
      letter: state.student.letter,
      date: dateStr,
      scores: state.scores,
      total
    })
  })
    .then(() => showDone(true))
    .catch(() => showDone(false));
}

function showDone(ok) {
  el.screenQuiz.hidden = true;
  el.screenDone.hidden = false;
  el.finishEmoji.textContent = ok ? '✅' : '⚠️';
  el.finishTitle.textContent = ok ? 'Ответы отправлены' : 'Проблема с отправкой';
  el.finishText.textContent = ok
    ? 'Спасибо! Ваши ответы переданы учителю. Оценку вы узнаете от учителя.'
    : 'Не удалось отправить ответы. Сообщите учителю.';
}
