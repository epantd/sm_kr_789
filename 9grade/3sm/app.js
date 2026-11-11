'use strict';

/* ==========================================================
   САМОСТОЯТЕЛЬНАЯ РАБОТА 9 КЛАСС
   12 заданий: БД + Графы
   ========================================================== */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyF2x-qnIPerEebab8j4PXEr_U7csUGruQROCLgsKYGRUgeBvMjiHnBSEfpGhE881Wk/exec';
const WORK_ID = '9-3sm';
const TOTAL_TASKS = 12;

/* ---------------------- ДАННЫЕ ДЛЯ БД ---------------------- */

const NAMES = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Фёдоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семёнов'];
const CITIES = ['Москва', 'Казань', 'Сочи'];
const SCORES = [3, 4, 5];

/* ---------------------- ГРАФЫ ---------------------- */

const NODES = {
  A: { x: 80,  y: 200 },
  B: { x: 180, y: 100 },
  C: { x: 200, y: 300 },
  E: { x: 300, y: 200 },
  D: { x: 320, y: 120 },
  F: { x: 340, y: 280 },
  G: { x: 440, y: 200 }
};

const POSSIBLE_EDGES = [
  ['A', 'B'], ['A', 'C'], ['A', 'E'],
  ['B', 'D'], ['B', 'E'],
  ['C', 'E'], ['C', 'F'],
  ['D', 'G'],
  ['E', 'D'], ['E', 'F'], ['E', 'G'],
  ['F', 'G']
];

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

/* ---------------------- АЛГОРИТМ ГРАФОВ ---------------------- */

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
    if (countPaths(edges, start, node) > 0 && countPaths(edges, node, end) > 0) {
      valid.push(node);
    }
  });
  return valid;
}

function generateRandomEdges(targetMin, targetMax) {
  let bestEdges = null;
  let bestDiff = Infinity;
  const target = (targetMin + targetMax) / 2;

  for (let attempt = 0; attempt < 300; attempt++) {
    const edges = [];
    POSSIBLE_EDGES.forEach(([u, v]) => {
      if (Math.random() < 0.55) edges.push([u, v]);
    });

    // Проверка на отсутствие тупиков (кроме A и G)
    let valid = true;
    for (const node of Object.keys(NODES)) {
      if (node === 'A' || node === 'G') continue;
      if (!edges.some(([u, v]) => v === node) || !edges.some(([u, v]) => u === node)) {
        valid = false; break;
      }
    }
    if (!valid) continue;

    const paths = countPaths(edges, 'A', 'G');
    if (paths >= targetMin && paths <= targetMax) return edges;

    if (paths > 0) {
      const diff = Math.abs(paths - target);
      if (diff < bestDiff) { bestDiff = diff; bestEdges = edges; }
    }
  }
  return bestEdges || [['A','B'], ['A','C'], ['A','E'], ['B','D'], ['B','E'], ['C','E'], ['C','F'], ['D','G'], ['E','D'], ['E','F'], ['E','G'], ['F','G']];
}

/* ---------------------- ГЕНЕРАЦИЯ ЗАДАНИЙ ---------------------- */

function generateTasks() {
  const tasks = [];
  let lastAnswer = null; // Защита от подряд идущих одинаковых ответов

  // --- Блок 1: База данных (4 задания) ---
  const students = [];
  for (let i = 0; i < 10; i++) {
    students.push({
      name: pick(NAMES),
      city: pick(CITIES),
      math: pick(SCORES),
      rus: pick(SCORES),
      eng: pick(SCORES)
    });
  }

  const dbTableHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Фамилия</th><th>Город</th><th>Математика</th><th>Русский</th><th>Английский</th></tr></thead>
        <tbody>
          ${students.map(s => `<tr><td>${s.name}</td><td>${s.city}</td><td>${s.math}</td><td>${s.rus}</td><td>${s.eng}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  const cMath5 = students.filter(s => s.math === 5).length;
  const cRus4 = students.filter(s => s.rus >= 4).length;
  const cEng4 = students.filter(s => s.eng >= 4).length;

  tasks.push({
    type: 'input',
    instruction: `Рассмотрите таблицу успеваемости.\nСколько учеников получили оценку «5» по математике?`,
    tableHtml: dbTableHTML,
    correct: String(cMath5)
  });
  tasks.push({
    type: 'input',
    instruction: `Сколько учеников получили «4» или «5» по русскому языку?`,
    tableHtml: dbTableHTML,
    correct: String(cRus4)
  });
  tasks.push({
    type: 'input',
    instruction: `Сколько учеников получили «4» или «5» по английскому языку?`,
    tableHtml: dbTableHTML,
    correct: String(cEng4)
  });

  // Генерация диаграмм для 4-го задания
  const chartDataCorrect = { math: cMath5, rus: cRus4, eng: cEng4 };
  const colors = { math: '#4f6ef7', rus: '#16a34a', eng: '#f59e0b' };
  
  function buildPieSvg(data) {
    const total = data.math + data.rus + data.eng;
    if (total === 0) return '';
    let acc = 0;
    const parts = [];
    const labels = [];
    const keys = ['math', 'rus', 'eng'];
    const names = { math: 'Мат', rus: 'Рус', eng: 'Англ' };
    
    keys.forEach(k => {
      const pct = (data[k] / total) * 100;
      if (pct > 0) {
        parts.push(`${colors[k]} ${acc}% ${acc + pct}%`);
        labels.push(`${names[k]}: ${data[k]}`);
        acc += pct;
      }
    });
    
    const gradient = `conic-gradient(${parts.join(', ')})`;
    return `
      <div class="pie-svg" style="background: ${gradient}; border-radius: 50%;"></div>
      <div class="pie-legend">${labels.join(', ')}</div>
    `;
  }

  const wrong1 = { math: cRus4, rus: cMath5, eng: cEng4 }; // Перепутаны местами
  const wrong2 = { math: cMath5 + 1, rus: cRus4 - 1, eng: cEng4 };
  const wrong3 = { math: cMath5 - 1, rus: cRus4 + 1, eng: cEng4 };
  
  const chartOptions = [
    { html: buildPieSvg(chartDataCorrect), isCorrect: true },
    { html: buildPieSvg(wrong1), isCorrect: false },
    { html: buildPieSvg(wrong2), isCorrect: false },
    { html: buildPieSvg(wrong3), isCorrect: false }
  ];
  shuffle(chartOptions);

  tasks.push({
    type: 'chart',
    instruction: 'Выберите круговую диаграмму, которая соответствует данным из заданий 1–3 (количество пятёрок по математике, количество 4 и 5 по русскому, количество 4 и 5 по английскому).',
    options: chartOptions,
    correct: chartOptions.findIndex(o => o.isCorrect)
  });

  // --- Блок 2: Простые пути (4 задания) ---
  for (let i = 0; i < 4; i++) {
    let edges, paths;
    do {
      edges = generateRandomEdges(4, 25);
      paths = countPaths(edges, 'A', 'G');
    } while (paths === lastAnswer);
    lastAnswer = paths;

    tasks.push({
      type: 'input',
      instruction: 'На рисунке — схема дорог. По каждой дороге можно двигаться только в одном направлении (по стрелке).\nСколько существует различных путей из города A в город G?',
      graphEdges: edges,
      correct: String(paths)
    });
  }

  // --- Блок 3: Не проходящие пути (2 задания) ---
  for (let i = 0; i < 2; i++) {
    let edges, paths, targetNode;
    do {
      edges = generateRandomEdges(4, 25);
      const intermediates = getIntermediateNodes(edges, 'A', 'G');
      if (intermediates.length === 0) continue;
      
      targetNode = pick(intermediates);
      const total = countPaths(edges, 'A', 'G');
      const through = countPaths(edges, 'A', targetNode) * countPaths(edges, targetNode, 'G');
      paths = total - through;
    } while (paths === lastAnswer || paths <= 0);
    lastAnswer = paths;

    tasks.push({
      type: 'input',
      instruction: `На рисунке — схема дорог.\nСколько существует различных путей из города A в город G, **не проходящих** через город ${targetNode}?`,
      graphEdges: edges,
      correct: String(paths)
    });
  }

  // --- Блок 4: Проходящие пути (2 задания) ---
  for (let i = 0; i < 2; i++) {
    let edges, paths, targetNode;
    do {
      edges = generateRandomEdges(4, 25);
      const intermediates = getIntermediateNodes(edges, 'A', 'G');
      if (intermediates.length === 0) continue;
      
      targetNode = pick(intermediates);
      paths = countPaths(edges, 'A', targetNode) * countPaths(edges, targetNode, 'G');
    } while (paths === lastAnswer || paths <= 0);
    lastAnswer = paths;

    tasks.push({
      type: 'input',
      instruction: `На рисунке — схема дорог.\nСколько существует различных путей из города A в город G, **проходящих** через город ${targetNode}?`,
      graphEdges: edges,
      correct: String(paths)
    });
  }

  return tasks;
}

/* ---------------------- ОТРИСОВКА SVG ГРАФА ---------------------- */

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
    line.setAttribute('x1', p1.x + ux * 6); line.setAttribute('y1', p1.y + uy * 6);
    line.setAttribute('x2', p2.x - ux * 14); line.setAttribute('y2', p2.y - uy * 14);
    line.setAttribute('stroke', '#b45309'); line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrow)');
    svg.appendChild(line);
  });

  for (const [label, pos] of Object.entries(NODES)) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pos.x); circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', '4'); circle.setAttribute('fill', '#b45309');
    group.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', pos.x); text.setAttribute('y', pos.y - 10);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('font-size', '16'); text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#1e293b');
    text.textContent = label;
    group.appendChild(text);
    svg.appendChild(group);
  }
  return svg;
}

/* ---------------------- СОСТОЯНИЕ ---------------------- */

const state = {
  student: { lastName: '', firstName: '', grade: '', letter: '' },
  tasks: [],
  index: 0,
  answers: [],
  scores: [],
  warnedSkip: false,
  submitted: false
};

/* ---------------------- DOM ---------------------- */

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

/* ---------------------- СТАРТ ---------------------- */

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
  state.submitted = false;

  el.screenStart.hidden = true;
  el.screenQuiz.hidden = false;
  renderTask();
});

/* ---------------------- РЕНДЕР ЗАДАНИЯ ---------------------- */

function renderTask() {
  const task = state.tasks[state.index];
  state.warnedSkip = false;
  updateProgress();

  let html = '';
  html += `<p class="task-topic">Задание ${state.index + 1} из ${state.tasks.length}</p>`;
  html += `<p class="task-instruction">${escapeHtml(task.instruction).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</p>`;

  if (task.tableHtml) html += task.tableHtml;

  if (task.graphEdges) {
    html += `<div class="graph-container" id="graph-container"></div>`;
  }

  if (task.type === 'input') {
    html += `<div class="input-wrap">
               <input type="text" inputmode="numeric" id="inputAnswer" class="input-answer" placeholder="Ответ" autocomplete="off">
             </div>`;
    state.answers[state.index] = null;
  } else if (task.type === 'chart') {
    html += `<div class="charts-grid">`;
    task.options.forEach((opt, i) => {
      html += `<div class="chart-option" data-index="${i}">${opt.html}</div>`;
    });
    html += `</div>`;
    state.answers[state.index] = null;
  }

  html += '<div class="feedback" id="feedback"></div>';
  html += `<div class="actions">
             <button type="button" class="btn btn-primary" id="nextBtn">
               ${state.index === state.tasks.length - 1 ? 'Завершить и отправить' : 'Далее →'}
             </button>
           </div>`;

  el.taskCard.innerHTML = html;

  // Отрисовка графа
  if (task.graphEdges) {
    document.getElementById('graph-container').appendChild(renderGraphToSVG(task.graphEdges));
  }

  // События
  if (task.type === 'input') {
    const inp = document.getElementById('inputAnswer');
    inp.addEventListener('input', () => {
      state.answers[state.index] = inp.value.trim();
      document.getElementById('feedback').textContent = '';
    });
    setTimeout(() => inp.focus(), 100);
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('nextBtn').click(); }
    });
  } else if (task.type === 'chart') {
    document.querySelectorAll('.chart-option').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.chart-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        state.answers[state.index] = Number(el.dataset.index);
        document.getElementById('feedback').textContent = '';
      });
    });
  }

  document.getElementById('nextBtn').addEventListener('click', onNext);
}

function updateProgress() {
  const total = state.tasks.length;
  el.progressText.textContent = `Задание ${state.index + 1} из ${total}`;
  el.progressFill.style.width = `${(state.index / total) * 100}%`;
}

/* ---------------------- ПЕРЕХОД ---------------------- */

function onNext() {
  const task = state.tasks[state.index];
  const ans = state.answers[state.index];

  if (ans === null || ans === undefined || ans === '') {
    if (!state.warnedSkip) {
      state.warnedSkip = true;
      document.getElementById('feedback').textContent = 'Вы не ввели ответ. Нажмите «Далее» ещё раз, чтобы пропустить без балла.';
      return;
    }
    state.scores[state.index] = 0;
  } else {
    let isCorrect = false;
    if (task.type === 'input') {
      isCorrect = String(ans).trim().replace(/\s/g, '') === task.correct;
    } else if (task.type === 'chart') {
      isCorrect = Number(ans) === task.correct;
    }
    state.scores[state.index] = isCorrect ? 1 : 0;
  }

  if (state.index < state.tasks.length - 1) {
    state.index++;
    renderTask();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    submitResults();
  }
}

/* ---------------------- ОТПРАВКА ---------------------- */

function submitResults() {
  el.progressFill.style.width = '100%';
  el.progressText.textContent = 'Отправка…';

  const total = state.scores.reduce((a, b) => a + b, 0);
  const now = new Date();
  const dateStr = now.toLocaleString('ru-RU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });

  const payload = {
    work: WORK_ID,
    lastName: state.student.lastName,
    firstName: state.student.firstName,
    grade: state.student.grade,
    letter: state.student.letter,
    date: dateStr,
    scores: state.scores,
    total: total
  };

  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  })
    .then(() => showDone(true))
    .catch(() => showDone(false));
}

function showDone(ok) {
  state.submitted = true;
  el.screenQuiz.hidden = true;
  el.screenDone.hidden = false;
  el.finishEmoji.textContent = ok ? '✅' : '⚠️';
  el.finishTitle.textContent = ok ? 'Ответы отправлены' : 'Проблема с отправкой';
  el.finishText.textContent = ok
    ? 'Спасибо! Ваши ответы переданы учителю. Оценку вы узнаете от учителя.'
    : 'Не удалось отправить ответы. Сообщите учителю.';
}