'use strict';

/* ==========================================================
   САМОСТОЯТЕЛЬНАЯ РАБОТА 9 КЛАСС
   4 (БД + средний балл + диаграмма) + 4 + 2 + 2 = 12 заданий
   ========================================================== */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyF2x-qnIPerEebab8j4PXEr_U7csUGruQROCLgsKYGRUgeBvMjiHnBSEfpGhE881Wk/exec';
const WORK_ID = '9-3sm';
const TOTAL_TASKS = 12;
const STUDENTS_COUNT = 20;

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
   БЛОК 1: БАЗА ДАННЫХ + СРЕДНИЙ БАЛЛ
   ========================================================== */

const SURNAMES = [
  'Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров',
  'Соколов', 'Михайлов', 'Новиков', 'Фёдоров', 'Морозов', 'Волков',
  'Алексеев', 'Лебедев', 'Семёнов', 'Козлов', 'Степанов', 'Николаев',
  'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров', 'Зайцев',
  'Соловьёв', 'Борисов', 'Яковлев', 'Григорьев', 'Романов', 'Воробьёв',
  'Сергеев', 'Кузьмин', 'Фролов', 'Александров', 'Дмитриев'
];
const CITIES = ['Москва', 'Казань', 'Сочи'];
const GENDERS = ['М', 'Ж'];
const GRADES = [3, 4, 5];

const DB_COLUMNS = [
  { key: 'name',   label: 'Фамилия',    numeric: false },
  { key: 'city',   label: 'Город',      numeric: false },
  { key: 'gender', label: 'Пол',        numeric: false },
  { key: 'math',   label: 'Математика', numeric: true },
  { key: 'rus',    label: 'Русский',    numeric: true },
  { key: 'eng',    label: 'Английский', numeric: true }
];

// 4 задания: 3 фильтр-вопроса (для диаграммы) + 1 про среднее
const DB_TASK_CONFIGS = [
  [
    { text: 'Из Москвы получили «5» по математике', fn: s => s.city === 'Москва' && s.math === 5 },
    { text: 'Девочки получили «4» или «5» по русскому', fn: s => s.gender === 'Ж' && s.rus >= 4 },
    { text: 'Из Казани получили «4» или «5» по английскому', fn: s => s.city === 'Казань' && s.eng >= 4 },
    { type: 'avg', text: 'Средний балл по математике у учеников из Сочи',
      filterFn: s => s.city === 'Сочи', column: 'math' }
  ],
  [
    { text: 'Мальчики из Сочи получили «5» по русскому', fn: s => s.city === 'Сочи' && s.gender === 'М' && s.rus === 5 },
    { text: 'Девочки получили «5» по английскому', fn: s => s.gender === 'Ж' && s.eng === 5 },
    { text: 'Ученики с «4» и «5» по всем трём предметам', fn: s => s.math >= 4 && s.rus >= 4 && s.eng >= 4 },
    { type: 'avg', text: 'Средний балл по английскому у девочек',
      filterFn: s => s.gender === 'Ж', column: 'eng' }
  ],
  [
    { text: 'Из Казани получили «4» по математике', fn: s => s.city === 'Казань' && s.math === 4 },
    { text: 'Девочки из Москвы получили «3» по русскому', fn: s => s.city === 'Москва' && s.gender === 'Ж' && s.rus === 3 },
    { text: 'Мальчики получили «5» по математике', fn: s => s.gender === 'М' && s.math === 5 },
    { type: 'avg', text: 'Средний балл по русскому у учеников из Казани',
      filterFn: s => s.city === 'Казань', column: 'rus' }
  ],
  [
    { text: 'Из Москвы получили «4» по математике', fn: s => s.city === 'Москва' && s.math === 4 },
    { text: 'Девочки получили «5» и по русскому, и по английскому', fn: s => s.gender === 'Ж' && s.rus === 5 && s.eng === 5 },
    { text: 'Из Сочи получили «5» по всем трём предметам', fn: s => s.city === 'Сочи' && s.math === 5 && s.rus === 5 && s.eng === 5 },
    { type: 'avg', text: 'Средний балл по математике у мальчиков',
      filterFn: s => s.gender === 'М', column: 'math' }
  ]
];

function generateStudents() {
  const names = shuffle([...SURNAMES]).slice(0, STUDENTS_COUNT);
  return names.map(name => ({
    name,
    city: pick(CITIES),
    gender: pick(GENDERS),
    math: pick(GRADES),
    rus: pick(GRADES),
    eng: pick(GRADES)
  }));
}

function computeAverage(students, filterFn, column) {
  const matching = students.filter(filterFn);
  if (!matching.length) return null;
  const vals = matching.map(s => Number(s[column])).filter(v => !isNaN(v));
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return avg;
}

function generateDBTask(taskIndex) {
  const config = DB_TASK_CONFIGS[taskIndex];
  const filterConfigs = config.filter(c => c.type !== 'avg');
  const avgConfig = config.find(c => c.type === 'avg');

  let students = null;
  let values = null;
  let avgInfo = null;

  for (let attempt = 0; attempt < 500; attempt++) {
    const candidateStudents = generateStudents();

    // Проверяем 3 фильтр-значения
    const candidateValues = filterConfigs.map(cfg => candidateStudents.filter(cfg.fn).length);

    // Каждое значение от 2 до 10, все разные, без сильного перекоса
    if (candidateValues.some(v => v < 2 || v > 10)) continue;
    if (candidateValues[0] === candidateValues[1] ||
        candidateValues[1] === candidateValues[2] ||
        candidateValues[0] === candidateValues[2]) continue;
    if (Math.max(...candidateValues) / Math.min(...candidateValues) > 4) continue;

    // Проверяем средний балл
    const matching = candidateStudents.filter(avgConfig.filterFn);
    if (matching.length < 3) continue;

    const avg = computeAverage(candidateStudents, avgConfig.filterFn, avgConfig.column);
    if (avg === null) continue;

    // Среднее не должно быть ровно целым (иначе угадать легко)
    if (Math.abs(avg - Math.round(avg)) < 0.05) continue;

    students = candidateStudents;
    values = candidateValues;
    avgInfo = {
      text: avgConfig.text,
      filterFn: avgConfig.filterFn,
      column: avgConfig.column,
      correct: avg.toFixed(2)
    };
    break;
  }

  // Fallback — если за 500 раз не нашли «идеальный» набор
  if (!students) {
    students = generateStudents();
    values = filterConfigs.map(cfg => students.filter(cfg.fn).length);
    const avg = computeAverage(students, avgConfig.filterFn, avgConfig.column) || 0;
    avgInfo = {
      text: avgConfig.text,
      filterFn: avgConfig.filterFn,
      column: avgConfig.column,
      correct: avg.toFixed(2)
    };
  }

  return {
    type: 'db_chart',
    students,
    subQuestions: filterConfigs.map((c, i) => ({ text: c.text, correct: String(values[i]) })),
    avgQuestion: avgInfo
  };
}

/* ---------- Рендер БД-задания ---------- */

function renderDBTaskHTML(task) {
  let html = '';

  // Верхняя панель
  html += '<div class="data-toolbar">';
  html += '<span class="data-toolbar-label">Таблица данных</span>';
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">';
  html += '<div class="menu-wrapper">';
  html += '<button type="button" class="toolbar-btn" id="insertMainBtn">Вставка ▾</button>';
  html += '<div class="dropdown-menu" id="insertMainMenu" hidden>';
  html += '<button type="button" class="dropdown-item" id="insertMainChart">📊 Диаграмма...</button>';
  html += '</div></div>';
  html += '<button type="button" class="toolbar-btn" id="sortMainBtn">↕ Сортировка</button>';
  html += '<button type="button" class="toolbar-btn" id="filterMainBtn">🔽 Фильтр</button>';
  html += '<button type="button" class="toolbar-btn" id="resetMainBtn">✖ Сбросить</button>';
  html += '</div></div>';

  // Основная таблица
  html += '<div class="table-wrap"><table class="data-table" id="dbTable"><thead><tr>';
  DB_COLUMNS.forEach(col => {
    html += `<th class="header-cell" data-col="${col.key}">
               <div class="th-inner"><span>${col.label}</span></div>
             </th>`;
  });
  html += '</tr></thead><tbody></tbody></table></div>';

  // Панель статистики снизу — заполняется в attachDBEvents
  html += '<div class="db-status-bar" id="dbStatsBar"></div>';

  // Мини-таблица для диаграммы (3 вопроса)
  html += '<p class="task-instruction" style="margin-top:16px;">Подсчитайте с помощью фильтров и впишите значения в мини-таблицу:</p>';
  html += '<table class="mini-table" id="dbMiniTable"><thead><tr><th>№</th><th>Вопрос</th><th>Ответ</th></tr></thead><tbody>';
  task.subQuestions.forEach((q, i) => {
    html += `<tr>
               <td>${i + 1}</td>
               <td style="text-align:left">${escapeHtml(q.text)}</td>
               <td><input type="text" inputmode="numeric" class="table-input" data-qidx="${i}" placeholder="?" maxlength="3"></td>
             </tr>`;
  });
  html += '</tbody></table>';

  // Блок вопроса про среднее
  html += `<div style="margin:18px auto;padding:14px 18px;background:#fef3c7;border-left:4px solid #b45309;border-radius:10px;max-width:650px;">
    <p style="margin:0 0 10px;font-size:14px;line-height:1.5;"><b>🧮 Дополнительный вопрос:</b> ${escapeHtml(task.avgQuestion.text)}</p>
    <input type="text" class="table-input" id="avgInput" placeholder="Среднее" style="width:140px;margin:0 auto;display:block;">
    <p style="margin:8px 0 0;font-size:12px;color:#b45309;text-align:center;">💡 Примените нужный фильтр, кликните по заголовку числового столбца — среднее появится в панели под таблицей.</p>
  </div>`;

  // Подсказка
  html += '<p class="table-info" style="text-align:center;color:var(--muted);">Выделите мини-таблицу (кликните по ней), затем нажмите «Вставка → Диаграмма...» в верхней панели.</p>';

  // Контейнер диаграммы
  html += '<div id="dbChartContainer"></div>';

  return html;
}

/* ---------- Логика БД-задания ---------- */

function attachDBEvents(task, ansObj) {
  const students = task.students;

  const stateFilters = {};
  const selectedHeaders = new Set();
  const filterHeaders = new Set();
  let sortCol = null, sortDir = 'asc';
  let miniTableSelected = false;
  let lastSelectedCol = null;

  const tableEl = document.getElementById('dbTable');
  const tbody = tableEl.querySelector('tbody');
  const statsBar = document.getElementById('dbStatsBar');
  const miniTableEl = document.getElementById('dbMiniTable');
  const chartContainer = document.getElementById('dbChartContainer');
  const insertMenu = document.getElementById('insertMainMenu');

  function getFilteredData() {
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
    return data;
  }

  function renderStatsBar(data) {
    let html = `<span>Строк: <b>${data.length}</b></span>`;
    if (lastSelectedCol) {
      const col = DB_COLUMNS.find(c => c.key === lastSelectedCol);
      if (col) {
        html += `<span>Столбец: <b>${col.label}</b></span>`;
        if (col.numeric) {
          const vals = data.map(s => Number(s[lastSelectedCol])).filter(v => !isNaN(v));
          if (vals.length) {
            const sum = vals.reduce((a, b) => a + b, 0);
            const avg = sum / vals.length;
            html += `<span>Сумма: <b>${sum}</b></span>`;
            html += `<span>Среднее: <b>${avg.toFixed(2)}</b></span>`;
          }
        }
      }
    }
    statsBar.innerHTML = html;
  }

  function renderRows() {
    const data = getFilteredData();
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
    renderStatsBar(data);
  }

  function renderHeader() {
    tableEl.querySelectorAll('th.header-cell').forEach(th => {
      const col = th.dataset.col;
      th.classList.toggle('selected-header', selectedHeaders.has(col));

      const thInner = th.querySelector('.th-inner');
      thInner.querySelectorAll('.filter-select').forEach(x => x.remove());

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

  // Клик по заголовку — выделение столбца
  tableEl.querySelectorAll('th.header-cell').forEach(th => {
    th.addEventListener('click', (e) => {
      if (e.target.closest('.filter-select')) return;
      const col = th.dataset.col;
      if (selectedHeaders.has(col)) selectedHeaders.delete(col);
      else selectedHeaders.add(col);
      lastSelectedCol = col;
      renderHeader();
      renderRows();
    });
  });

  // Фильтр
  document.getElementById('filterMainBtn').addEventListener('click', () => {
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

  // Сортировка
  document.getElementById('sortMainBtn').addEventListener('click', () => {
    const lastCol = [...selectedHeaders].pop() || lastSelectedCol;
    if (!lastCol) {
      alert('Сначала выделите столбец (кликните по заголовку), затем нажмите «Сортировка».');
      return;
    }
    if (sortCol === lastCol) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else { sortCol = lastCol; sortDir = 'asc'; }
    renderRows();
  });

  // Сброс
  document.getElementById('resetMainBtn').addEventListener('click', () => {
    filterHeaders.clear();
    selectedHeaders.clear();
    for (const k in stateFilters) delete stateFilters[k];
    sortCol = null;
    lastSelectedCol = null;
    renderHeader();
    renderRows();
  });

  // Вставка → Диаграмма
  const insertBtn = document.getElementById('insertMainBtn');
  insertBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    insertMenu.hidden = !insertMenu.hidden;
  });

  document.getElementById('insertMainChart').addEventListener('click', (e) => {
    e.stopPropagation();
    insertMenu.hidden = true;

    if (!miniTableSelected) {
      alert('Сначала выделите мини-таблицу (кликните по ней).');
      return;
    }

    const inputs = miniTableEl.querySelectorAll('.table-input');
    const vals = [];
    let allFilled = true;
    inputs.forEach(inp => {
      const v = inp.value.trim();
      if (!v) allFilled = false;
      vals.push(v);
    });

    const avgInput = document.getElementById('avgInput');
    const avgVal = avgInput.value.trim();
    if (!avgVal) allFilled = false;

    if (!allFilled) {
      alert('Заполните все поля (3 значения + средний балл) перед построением диаграммы.');
      return;
    }

    openChartWizard({
      onInsert: (type) => {
        ansObj.chartBuilt = true;
        ansObj.chartType = type;
        if (type === 'pie') {
          chartContainer.innerHTML = buildPieHTML(vals.map(v => parseInt(v, 10) || 0));
        } else {
          chartContainer.innerHTML = '<p style="text-align:center;color:var(--muted);">Выбрана диаграмма типа «' + type + '». Для этого задания нужна круговая.</p>';
        }
      }
    });
  });

  // Выделение мини-таблицы
  miniTableEl.addEventListener('click', (e) => {
    if (e.target.tagName === 'INPUT') return;
    miniTableSelected = true;
    miniTableEl.classList.add('selected');
  });
  miniTableEl.querySelectorAll('.table-input').forEach(inp => {
    inp.addEventListener('focus', () => {
      miniTableSelected = true;
      miniTableEl.classList.add('selected');
    });
  });

  // Закрытие меню
  document.addEventListener('click', () => { insertMenu.hidden = true; }, { once: true });

  renderHeader();
  renderRows();
}

/* ---------- Мастер диаграмм ---------- */

function openChartWizard({ onInsert }) {
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `
    <div class="modal-content">
      <button type="button" class="modal-close" id="cwClose">&times;</button>
      <h2 style="margin:0 0 14px;font-size:20px;">Мастер диаграмм</h2>
      <p style="font-size:13px;color:var(--muted);margin:0 0 12px;">Выберите тип диаграммы:</p>
      <div class="chart-type-options">
        <label class="chart-type-option"><input type="radio" name="ct" value="bar"><span>📊 Столбчатая</span></label>
        <label class="chart-type-option"><input type="radio" name="ct" value="pie"><span>🥧 Круговая</span></label>
        <label class="chart-type-option"><input type="radio" name="ct" value="line"><span>📈 Линейная</span></label>
      </div>
      <p id="cwMsg" style="color:var(--red);font-size:13px;text-align:center;min-height:18px;margin:6px 0;"></p>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button type="button" class="btn" style="background:#fff;color:var(--accent-dark);border:1px solid #c7d5f0;padding:10px 18px;" id="cwCancel">Отмена</button>
        <button type="button" class="btn btn-primary" style="padding:10px 18px;" id="cwOk">Готово</button>
      </div>
    </div>`;
  document.body.appendChild(ov);

  const msgEl = ov.querySelector('#cwMsg');
  const updateActive = () => {
    ov.querySelectorAll('.chart-type-option').forEach(l => l.classList.remove('active'));
    const checked = ov.querySelector('input[name="ct"]:checked');
    if (checked) {
      checked.closest('.chart-type-option').classList.add('active');
      msgEl.textContent = '';
    }
  };

  ov.querySelectorAll('input[name="ct"]').forEach(r => r.addEventListener('change', updateActive));

  const close = () => { ov.remove(); };
  ov.querySelector('#cwClose').addEventListener('click', close);
  ov.querySelector('#cwCancel').addEventListener('click', close);
  ov.querySelector('#cwOk').addEventListener('click', () => {
    const checked = ov.querySelector('input[name="ct"]:checked');
    if (!checked) {
      msgEl.textContent = 'Сначала выберите тип диаграммы.';
      return;
    }
    close();
    onInsert(checked.value);
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
   БЛОК 2–4: ГРАФЫ
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

// Безопасный fallback — гарантированно есть путь
const SAFE_FALLBACK_EDGES = [
  ['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'],
  ['C', 'E'], ['C', 'F'], ['D', 'G'], ['E', 'G'], ['F', 'G']
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
  return bestEdges || SAFE_FALLBACK_EDGES.slice();
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
    if (!p1 || !p2) return;
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
   ГЕНЕРАЦИЯ ЗАДАНИЙ (с защитой от бесконечного цикла)
   ========================================================== */

function generateSimpleGraphTask(lastAnswer) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const edges = generateRandomEdges(4, 25);
    const paths = countPaths(edges, 'A', 'G');
    if (paths > 0 && paths !== lastAnswer) {
      return { edges, paths };
    }
  }
  return { edges: SAFE_FALLBACK_EDGES.slice(), paths: countPaths(SAFE_FALLBACK_EDGES, 'A', 'G') };
}

function generateThroughTask(lastAnswer) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const edges = generateRandomEdges(4, 25);
    const inter = getIntermediateNodes(edges, 'A', 'G');
    if (!inter.length) continue;
    const targetNode = pick(inter);
    const paths = countPaths(edges, 'A', targetNode) * countPaths(edges, targetNode, 'G');
    if (paths > 0 && paths !== lastAnswer) {
      return { edges, targetNode, paths };
    }
  }
  // Fallback: E — известная промежуточная вершина в safe графе
  const edges = SAFE_FALLBACK_EDGES.slice();
  return { edges, targetNode: 'E', paths: countPaths(edges, 'A', 'E') * countPaths(edges, 'E', 'G') };
}

function generateNotThroughTask(lastAnswer) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const edges = generateRandomEdges(4, 25);
    const inter = getIntermediateNodes(edges, 'A', 'G');
    if (!inter.length) continue;
    const targetNode = pick(inter);
    const total = countPaths(edges, 'A', 'G');
    const through = countPaths(edges, 'A', targetNode) * countPaths(edges, targetNode, 'G');
    const paths = total - through;
    if (paths > 0 && paths !== lastAnswer) {
      return { edges, targetNode, paths };
    }
  }
  const edges = SAFE_FALLBACK_EDGES.slice();
  const total = countPaths(edges, 'A', 'G');
  const through = countPaths(edges, 'A', 'E') * countPaths(edges, 'E', 'G');
  return { edges, targetNode: 'E', paths: total - through };
}

function generateTasks() {
  const tasks = [];
  let lastAnswer = null;

  // 4 БД-задания
  for (let i = 0; i < 4; i++) tasks.push(generateDBTask(i));

  // 4 простых
  for (let i = 0; i < 4; i++) {
    const r = generateSimpleGraphTask(lastAnswer);
    lastAnswer = r.paths;
    tasks.push({
      type: 'graph',
      instruction: 'На рисунке — схема дорог. По каждой дороге можно двигаться только в одном направлении (по стрелке).\nСколько существует различных путей из города A в город G?',
      graphEdges: r.edges,
      correct: String(r.paths)
    });
  }

  // 2 НЕ через
  for (let i = 0; i < 2; i++) {
    const r = generateNotThroughTask(lastAnswer);
    lastAnswer = r.paths;
    tasks.push({
      type: 'graph',
      instruction: `На рисунке — схема дорог.\nСколько существует различных путей из города A в город G, **не проходящих** через город ${r.targetNode}?`,
      graphEdges: r.edges,
      correct: String(r.paths)
    });
  }

  // 2 через
  for (let i = 0; i < 2; i++) {
    const r = generateThroughTask(lastAnswer);
    lastAnswer = r.paths;
    tasks.push({
      type: 'graph',
      instruction: `На рисунке — схема дорог.\nСколько существует различных путей из города A в город G, **проходящих** через город ${r.targetNode}?`,
      graphEdges: r.edges,
      correct: String(r.paths)
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
      avgValue: '',
      chartBuilt: false,
      chartType: null
    };
    let html = `<p class="task-topic">Задание ${state.index + 1} · База данных</p>`;
    html += `<p class="task-instruction">Выделите заголовки нужных столбцов, нажмите «🔽 Фильтр» в верхней панели, настройте фильтры, подсчитайте строки. Заполните мини-таблицу и поле среднего балла, выделите мини-таблицу, постройте круговую диаграмму через «Вставка → Диаграмма...» (тип выбирайте сами).</p>`;
    html += renderDBTaskHTML(task);
    html += '<div class="feedback" id="feedback"></div>';
    html += `<div class="actions"><button type="button" class="btn btn-primary" id="nextBtn">${state.index === state.tasks.length - 1 ? 'Завершить и отправить' : 'Далее →'}</button></div>`;
    el.taskCard.innerHTML = html;

    document.querySelectorAll('.table-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = +inp.dataset.qidx;
        if (!isNaN(i)) state.answers[state.index].values[i] = inp.value.trim();
      });
    });

    const avgInput = document.getElementById('avgInput');
    if (avgInput) {
      avgInput.addEventListener('input', () => {
        state.answers[state.index].avgValue = avgInput.value.trim();
      });
    }

    attachDBEvents(task, state.answers[state.index]);
  } else {
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
    if (!ans.avgValue || !String(ans.avgValue).trim()) return true;
    if (!ans.chartBuilt) return true;
    return false;
  }
  if (task.type === 'graph') return !ans || !String(ans).trim();
  return true;
}

function checkAvgAnswer(avgQuestion, students, userVal) {
  const matching = students.filter(avgQuestion.filterFn);
  if (!matching.length) return false;
  const vals = matching.map(s => Number(s[avgQuestion.column])).filter(v => !isNaN(v));
  if (!vals.length) return false;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const userNum = parseFloat(String(userVal).trim().replace(',', '.'));
  if (isNaN(userNum)) return false;
  return Math.abs(userNum - avg) < 0.005;
}

function isCorrect(task, ans) {
  if (task.type === 'db_chart') {
    const valsOk = task.subQuestions.every((q, i) =>
      String(ans.values[i]).trim() === q.correct
    );
    const avgOk = checkAvgAnswer(task.avgQuestion, task.students, ans.avgValue);
    return valsOk && avgOk && ans.chartBuilt && ans.chartType === 'pie';
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
