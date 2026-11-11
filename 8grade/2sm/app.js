'use strict';

/* ==========================================================
   САМОСТОЯТЕЛЬНАЯ РАБОТА 8 КЛАСС · Логика и таблицы истинности
   ========================================================== */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyF2x-qnIPerEebab8j4PXEr_U7csUGruQROCLgsKYGRUgeBvMjiHnBSEfpGhE881Wk/exec';
const WORK_ID = '8-2sm';

/* ---------------------- ПУЛЫ ДАННЫХ ---------------------- */

const WORDS = [
  'Парта', 'Апельсин', 'Яблоко', 'Окно', 'Стол', 'Дом', 'Мяч', 'Ёж',
  'Ёлка', 'Улитка', 'Ручка', 'Книга', 'Кот', 'Лиса', 'Зима', 'Река',
  'Утро', 'Вечер', 'Туча', 'Звезда', 'Арбуз', 'Игра', 'Слон', 'Тигр',
  'Осёл', 'Ель', 'Ирис', 'Орёл', 'Астра', 'Ясень', 'Утка', 'Ёрш',
  'Индекс', 'Облако', 'Эхо', 'Юла', 'Акула', 'Оса', 'Ива', 'Енот'
];

const VOWELS = 'АЕЁИОУЫЭЮЯаеёиоуыэюя';
function isVowel(ch) { return VOWELS.includes(ch); }

/* ---------------------- ОПЕРАЦИИ (AST) ---------------------- */

const OPS = {
  '¬': { prec: 4, arity: 1 },
  '∧': { prec: 3, arity: 2, assoc: 'left' },
  '∨': { prec: 2, arity: 2, assoc: 'left' },
  '→': { prec: 1, arity: 2, assoc: 'right' },
  '≡': { prec: 0, arity: 2, assoc: 'left' },
};
const BINARY_OPS = ['∧', '∨', '→', '≡'];

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
function pickN(arr, n) { return shuffle(arr).slice(0, n); }

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function randomWrongPermutation(n) {
  const arr = [...Array(n).keys()];
  let attempts = 0;
  do {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    attempts++;
  } while (arr.every((v, i) => v === i) && attempts < 20);
  return arr;
}

/* ---------------------- AST: генерация / вычисление / печать ---------------------- */

function _tryGenerate(numVars, numOps) {
  const varNames = ['A', 'B', 'C', 'D'].slice(0, numVars);
  let trees = varNames.map(n => ({ type: 'var', name: n }));

  const numBinaries = numVars - 1;
  const numUnaries = numOps - numBinaries;
  if (numUnaries < 0) throw new Error('Слишком мало операций');

  const opSequence = shuffle([
    ...Array(numBinaries).fill('bin'),
    ...Array(numUnaries).fill('unary')
  ]);

  for (const op of opSequence) {
    if (op === 'bin') {
      let i = Math.floor(Math.random() * trees.length);
      let j;
      do { j = Math.floor(Math.random() * trees.length); } while (j === i);
      const binOp = pick(BINARY_OPS);
      const newTree = { type: 'bin', op: binOp, left: trees[Math.min(i, j)], right: trees[Math.max(i, j)] };
      const [hi, lo] = i > j ? [i, j] : [j, i];
      trees.splice(hi, 1);
      trees.splice(lo, 1);
      trees.push(newTree);
    } else {
      const candidates = trees.map((t, i) => t.type !== 'not' ? i : -1).filter(i => i >= 0);
      const idx = candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : Math.floor(Math.random() * trees.length);
      trees[idx] = { type: 'not', child: trees[idx] };
    }
  }
  return trees[0];
}

function hasDoubleNeg(node) {
  if (!node) return false;
  if (node.type === 'not') {
    if (node.child.type === 'not') return true;
    return hasDoubleNeg(node.child);
  }
  if (node.type === 'bin') return hasDoubleNeg(node.left) || hasDoubleNeg(node.right);
  return false;
}

function generateRandomExpr(numVars, numOps) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const ast = _tryGenerate(numVars, numOps);
    if (!hasDoubleNeg(ast)) return { ast, expr: astToString(ast) };
  }
  const ast = _tryGenerate(numVars, numOps);
  return { ast, expr: astToString(ast) };
}

function evaluate(node, env) {
  if (node.type === 'var') return env[node.name];
  if (node.type === 'not') return evaluate(node.child, env) ? 0 : 1;
  const l = evaluate(node.left, env);
  const r = evaluate(node.right, env);
  if (node.op === '∧') return (l && r) ? 1 : 0;
  if (node.op === '∨') return (l || r) ? 1 : 0;
  if (node.op === '→') return (!l || r) ? 1 : 0;
  if (node.op === '≡') return (l === r) ? 1 : 0;
  return 0;
}

function collectVars(node, set = new Set()) {
  if (node.type === 'var') set.add(node.name);
  else if (node.type === 'not') collectVars(node.child, set);
  else { collectVars(node.left, set); collectVars(node.right, set); }
  return [...set].sort();
}

function collectSteps(node, steps = []) {
  if (node.type === 'var') return steps;
  if (node.type === 'not') {
    collectSteps(node.child, steps);
    steps.push(node);
  } else {
    collectSteps(node.left, steps);
    collectSteps(node.right, steps);
    steps.push(node);
  }
  return steps;
}

function generateRows(vars) {
  const n = vars.length;
  const rows = [];
  for (let i = 0; i < (1 << n); i++) {
    const env = {};
    vars.forEach((v, j) => { env[v] = (i >> (n - 1 - j)) & 1; });
    rows.push(env);
  }
  return rows;
}

function nodePrec(node) {
  if (node.type === 'var') return 100;
  if (node.type === 'not') return 4;
  return OPS[node.op].prec;
}

function astToString(node, parentPrec = -1, side = null, parentOp = null) {
  if (node.type === 'var') return node.name;

  if (node.type === 'not') {
    const childP = nodePrec(node.child);
    const inner = astToString(node.child);
    return '¬' + (childP < 4 ? '(' + inner + ')' : inner);
  }

  const p = OPS[node.op].prec;
  const l = astToString(node.left, p, 'left', node.op);
  const r = astToString(node.right, p, 'right', node.op);
  let s = l + ' ' + node.op + ' ' + r;

  let needParens = false;
  if (p < parentPrec) needParens = true;
  else if (p === parentPrec && parentOp) {
    const parentAssoc = OPS[parentOp].assoc;
    if (side === 'right' && parentAssoc === 'left') needParens = true;
    if (side === 'left' && parentAssoc === 'right') needParens = true;
  }
  if (needParens) s = '(' + s + ')';
  return s;
}

/* ==========================================================
   ГЕНЕРАЦИЯ ЗАДАНИЙ (12 штук)
   ========================================================== */

/* --- 3 задания: подбор слова/числа --- */

function genWordTask() {
  const conditions = [
    { text: 'НЕ (Первая буква гласная)', fn: w => !isVowel(w[0]) },
    { text: 'НЕ (Последняя буква гласная)', fn: w => !isVowel(w[w.length - 1]) },
    { text: '(Первая буква согласная) И (Последняя буква гласная)', fn: w => !isVowel(w[0]) && isVowel(w[w.length - 1]) },
    { text: '(Первая буква гласная) ИЛИ (Последняя буква гласная)', fn: w => isVowel(w[0]) || isVowel(w[w.length - 1]) },
    { text: '(Первая буква гласная) И (Последняя буква согласная)', fn: w => isVowel(w[0]) && !isVowel(w[w.length - 1]) }
  ];
  const cond = pick(conditions);
  const fitting = WORDS.filter(w => cond.fn(w));
  const notFitting = WORDS.filter(w => !cond.fn(w));
  if (fitting.length < 1 || notFitting.length < 3) return genWordTask();
  const correct = pick(fitting);
  const wrong = pickN(notFitting, 3);
  return {
    topic: 'Логическое высказывание',
    type: 'choice',
    instruction: `Выберите слово, для которого истинно высказывание:\n\n${cond.text}`,
    options: shuffle([correct, ...wrong]),
    correct
  };
}

function genNumberTask() {
  const conditions = [
    { text: '(Первая цифра чётная) И (Вторая цифра чётная)', fn: s => +s[0] % 2 === 0 && +s[1] % 2 === 0 },
    { text: '(Первая цифра нечётная) И (Последняя цифра чётная)', fn: s => +s[0] % 2 === 1 && +s[3] % 2 === 0 },
    { text: '(Сумма всех цифр чётная)', fn: s => s.split('').reduce((a, c) => a + (+c), 0) % 2 === 0 },
    { text: '(Первая цифра больше последней)', fn: s => +s[0] > +s[3] },
    { text: '(Последняя цифра нечётная) И (Сумма цифр больше 20)', fn: s => +s[3] % 2 === 1 && s.split('').reduce((a, c) => a + (+c), 0) > 20 }
  ];
  const cond = pick(conditions);
  const fitting = [];
  const notFitting = [];
  for (let i = 0; i < 500; i++) {
    const n = '' + randInt(1, 9) + randInt(0, 9) + randInt(0, 9) + randInt(0, 9);
    if (cond.fn(n)) { if (fitting.length < 5) fitting.push(n); }
    else { if (notFitting.length < 5) notFitting.push(n); }
    if (fitting.length >= 5 && notFitting.length >= 5) break;
  }
  if (fitting.length < 1 || notFitting.length < 3) return genNumberTask();
  const correct = pick(fitting);
  const wrong = pickN(notFitting, 3);
  return {
    topic: 'Логическое высказывание',
    type: 'choice',
    instruction: `Выберите 4-значное число, для которого истинно высказывание:\n\n${cond.text}`,
    options: shuffle([correct, ...wrong]),
    correct
  };
}

/* --- 4 задания: наибольшее / наименьшее X --- */

const INEQ_TEMPLATES = [
  // Наибольшее: (X >= A) И НЕ (X > B) → B
  () => { const A = randInt(-10, 20), B = A + randInt(3, 15);
    return { instruction: `Напишите наибольшее целое число x, для которого истинно высказывание:\n\n(X >= ${A}) И НЕ (X > ${B})`, correct: String(B) }; },
  // Наименьшее: (X > A) И (X < B) → A+1
  () => { const A = randInt(-10, 20), B = A + randInt(3, 15);
    return { instruction: `Напишите наименьшее целое число x, для которого истинно высказывание:\n\n(X > ${A}) И (X < ${B})`, correct: String(A + 1) }; },
  // Наибольшее: НЕ (X < A) И НЕ (X > B) → B (A ≤ X ≤ B)
  () => { const A = randInt(-10, 20), B = A + randInt(3, 15);
    return { instruction: `Напишите наибольшее целое число x, для которого истинно высказывание:\n\nНЕ (X < ${A}) И НЕ (X > ${B})`, correct: String(B) }; },
  // Наименьшее: (X >= A) И (X > B) → max(A, B+1)
  () => { const A = randInt(-10, 20), B = A + randInt(3, 15);
    return { instruction: `Напишите наименьшее целое число x, для которого истинно высказывание:\n\n(X >= ${A}) И (X > ${B})`, correct: String(Math.max(A, B + 1)) }; },
  // Наибольшее: (X < A) И (X <= B) → min(A, B) - 1
  () => { const A = randInt(-10, 20), B = A + randInt(3, 15);
    return { instruction: `Напишите наибольшее целое число x, для которого истинно высказывание:\n\n(X < ${A}) И (X <= ${B})`, correct: String(Math.min(A, B) - 1) }; },
  // Наименьшее: (X >= A) И (X >= B) → max(A, B)
  () => { const A = randInt(-10, 20), B = A + randInt(3, 15);
    return { instruction: `Напишите наименьшее целое число x, для которого истинно высказывание:\n\n(X >= ${A}) И (X >= ${B})`, correct: String(Math.max(A, B)) }; }
];

function genInequalityTask() {
  const tpl = pick(INEQ_TEMPLATES);
  const t = tpl();
  return {
    topic: 'Логическое высказывание',
    type: 'input',
    instruction: t.instruction,
    correct: t.correct
  };
}

/* --- Таблица истинности (2 варианта рендера) --- */

function buildTruthData(ast) {
  const steps = collectSteps(ast);
  const vars = collectVars(ast);
  const rows = generateRows(vars);
  const answers = rows.map(env => steps.map(s => evaluate(s, env)));
  const labels = steps.map(s => astToString(s));
  return { ast, steps, vars, rows, answers, labels };
}

function genTruthTask(numVars, numOps) {
  const g = generateRandomExpr(numVars, numOps);
  const data = buildTruthData(g.ast);
  return {
    topic: 'Таблицы истинности',
    type: 'truth',
    ...data,
    instruction: 'Заполните таблицу истинности. В каждую ячейку введите 0 или 1.'
  };
}

function genDragTruthTask(numVars, numOps) {
  const g = generateRandomExpr(numVars, numOps);
  const data = buildTruthData(g.ast);
  return {
    topic: 'Таблицы истинности',
    type: 'drag_truth',
    ...data,
    initialOrder: randomWrongPermutation(data.steps.length),
    instruction: 'Сначала расставьте столбцы в правильном порядке действий (перетаскиванием или обменом через клик), затем заполните таблицу истинности.'
  };
}

/* --- Полный набор из 12 заданий --- */

function generateTasks() {
  const tasks = [];
  tasks.push(genWordTask());
  tasks.push(genNumberTask());
  tasks.push(genWordTask());
  for (let i = 0; i < 4; i++) tasks.push(genInequalityTask());
  for (let i = 0; i < 3; i++) tasks.push(genTruthTask(2, 3));
  for (let i = 0; i < 2; i++) tasks.push(genDragTruthTask(3, 4));
  return tasks;
}

/* ==========================================================
   СОСТОЯНИЕ
   ========================================================== */

const state = {
  student: { lastName: '', firstName: '', grade: '', letter: '' },
  tasks: [],
  index: 0,
  answers: [],
  scores: [],
  warnedSkip: false,
  submitted: false
};

/* ==========================================================
   DOM
   ========================================================== */

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
  state.submitted = false;

  el.screenStart.hidden = true;
  el.screenQuiz.hidden = false;
  renderTask();
});

/* ==========================================================
   РЕНДЕР ЗАДАНИЯ
   ========================================================== */

function renderTask() {
  const task = state.tasks[state.index];
  state.warnedSkip = false;
  updateProgress();

  let html = '';
  html += `<p class="task-topic">${escapeHtml(task.topic)} · Задание ${state.index + 1} из ${state.tasks.length}</p>`;
  html += `<p class="task-instruction">${escapeHtml(task.instruction)}</p>`;

  if (task.type === 'choice') html += renderChoice(task);
  else if (task.type === 'input') html += renderInput(task);
  else if (task.type === 'truth') html += renderTruthTable(task);
  else if (task.type === 'drag_truth') html += renderDragTruth(task);

  html += '<div class="feedback" id="feedback"></div>';
  html += `<div class="actions">
             <button type="button" class="btn btn-primary" id="nextBtn">
               ${state.index === state.tasks.length - 1 ? 'Завершить и отправить' : 'Далее →'}
             </button>
           </div>`;

  el.taskCard.innerHTML = html;

  // Инициализация ответа
  if (task.type === 'choice') {
    state.answers[state.index] = null;
    document.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.answers[state.index] = btn.dataset.value;
        document.getElementById('feedback').textContent = '';
      });
    });
  } else if (task.type === 'input') {
    state.answers[state.index] = null;
    const inp = document.getElementById('inputAnswer');
    inp.addEventListener('input', () => {
      state.answers[state.index] = inp.value;
      document.getElementById('feedback').textContent = '';
    });
    setTimeout(() => inp.focus(), 100);
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('nextBtn').click(); }
    });
  } else if (task.type === 'truth') {
    attachTruthEvents(task);
  } else if (task.type === 'drag_truth') {
    attachDragTruthEvents(task);
  }

  document.getElementById('nextBtn').addEventListener('click', onNext);
}

function updateProgress() {
  const total = state.tasks.length;
  el.progressText.textContent = `Задание ${state.index + 1} из ${total}`;
  el.progressFill.style.width = `${(state.index / total) * 100}%`;
}

/* ---------- Choice ---------- */
function renderChoice(task) {
  let html = '<div class="options">';
  task.options.forEach(opt => {
    html += `<button type="button" class="option" data-value="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`;
  });
  html += '</div>';
  return html;
}

/* ---------- Input ---------- */
function renderInput(task) {
  return `<div class="input-wrap">
            <input type="text" inputmode="numeric" id="inputAnswer" class="input-answer" placeholder="Введите число" autocomplete="off">
          </div>`;
}

/* ---------- Truth (без перестановки) ---------- */
function renderTruthTable(task) {
  const { vars, steps, rows, labels } = task;

  // Инициализация пустых значений
  state.answers[state.index] = {
    values: rows.map(() => steps.map(() => null))
  };

  let html = '<div class="table-wrap"><table class="truth-table"><thead><tr>';
  vars.forEach(v => { html += `<th>${v}</th>`; });
  steps.forEach((_, i) => {
    html += `<th class="op-col"><span class="step-num">${i + 1}</span><span class="op-text">${escapeHtml(labels[i])}</span></th>`;
  });
  html += '</tr></thead><tbody>';

  rows.forEach((env, r) => {
    html += '<tr>';
    vars.forEach(v => { html += `<td class="var-cell">${env[v]}</td>`; });
    steps.forEach((_, c) => {
      html += `<td><input class="cell-input" type="text" inputmode="numeric" maxlength="1" autocomplete="off" data-row="${r}" data-col="${c}"></td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

/* ---------- Drag truth (с перестановкой столбцов) ---------- */
function renderDragTruth(task) {
  const { vars, steps, rows, labels, initialOrder } = task;

  // Инициализация
  state.answers[state.index] = {
    order: initialOrder.slice(),
    values: rows.map(() => steps.map(() => null))
  };

  let html = '<div class="table-wrap"><table class="truth-table"><thead><tr>';
  vars.forEach(v => { html += `<th>${v}</th>`; });
  for (let pos = 0; pos < steps.length; pos++) {
    const logicalIdx = initialOrder[pos];
    html += `<th class="slot filled" draggable="true" data-pos="${pos}">
               <span class="slot-num">${pos + 1}</span>
               <span class="slot-content">${escapeHtml(labels[logicalIdx])}</span>
             </th>`;
  }
  html += '</tr></thead><tbody>';

  rows.forEach((env, r) => {
    html += '<tr>';
    vars.forEach(v => { html += `<td class="var-cell">${env[v]}</td>`; });
    steps.forEach((_, pos) => {
      html += `<td><input class="cell-input" type="text" inputmode="numeric" maxlength="1" autocomplete="off" data-row="${r}" data-col="${pos}"></td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

/* ==========================================================
   СОБЫТИЯ ДЛЯ ТАБЛИЦ ИСТИННОСТИ
   ========================================================== */

function attachTruthEvents(task) {
  const inputs = Array.from(document.querySelectorAll('.cell-input'));
  inputs.forEach((inp, idx) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/[^01]/g, '').slice(0, 1);
      const r = +inp.dataset.row;
      const c = +inp.dataset.col;
      state.answers[state.index].values[r][c] = inp.value === '' ? null : Number(inp.value);
      document.getElementById('feedback').textContent = '';
      if (inp.value !== '' && idx < inputs.length - 1) inputs[idx + 1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && inp.value === '' && idx > 0) inputs[idx - 1].focus();
    });
  });
}

function attachDragTruthEvents(task) {
  const inputs = Array.from(document.querySelectorAll('.cell-input'));
  inputs.forEach((inp, idx) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/[^01]/g, '').slice(0, 1);
      const r = +inp.dataset.row;
      const c = +inp.dataset.col;
      state.answers[state.index].values[r][c] = inp.value === '' ? null : Number(inp.value);
      document.getElementById('feedback').textContent = '';
      if (inp.value !== '' && idx < inputs.length - 1) inputs[idx + 1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && inp.value === '' && idx > 0) inputs[idx - 1].focus();
    });
  });

  // Перестановка столбцов
  const slots = document.querySelectorAll('.slot');
  let selectedPos = null;

  slots.forEach(slot => {
    slot.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', slot.dataset.pos);
      slot.classList.add('over');
    });
    slot.addEventListener('dragend', () => slot.classList.remove('over'));
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('over');
      const src = Number(e.dataTransfer.getData('text/plain'));
      const dst = +slot.dataset.pos;
      if (Number.isNaN(src) || src === dst) return;
      swapColumns(src, dst, task);
    });
    slot.addEventListener('click', () => {
      if (selectedPos === null) {
        selectedPos = +slot.dataset.pos;
        slot.classList.add('slot-selected');
      } else if (selectedPos === +slot.dataset.pos) {
        slot.classList.remove('slot-selected');
        selectedPos = null;
      } else {
        swapColumns(selectedPos, +slot.dataset.pos, task);
        selectedPos = null;
      }
    });
  });
}

function swapColumns(a, b, task) {
  const ans = state.answers[state.index];
  // Меняем местами логические индексы
  [ans.order[a], ans.order[b]] = [ans.order[b], ans.order[a]];
  // Меняем местами значения в столбцах
  for (let r = 0; r < ans.values.length; r++) {
    [ans.values[r][a], ans.values[r][b]] = [ans.values[r][b], ans.values[r][a]];
  }

  // Перерисовка шапок
  document.querySelectorAll('.slot').forEach((slot, pos) => {
    const logicalIdx = ans.order[pos];
    slot.querySelector('.slot-content').textContent = task.labels[logicalIdx];
    slot.classList.remove('slot-selected');
  });

  // Перерисовка значений в ячейках
  document.querySelectorAll('.cell-input').forEach(inp => {
    const r = +inp.dataset.row;
    const c = +inp.dataset.col;
    inp.value = ans.values[r][c] === null ? '' : ans.values[r][c];
  });
}

/* ==========================================================
   ПЕРЕХОД / ПРОВЕРКА
   ========================================================== */

function onNext() {
  const task = state.tasks[state.index];
  const ans = state.answers[state.index];

  if (isAnswerEmpty(task, ans)) {
    if (!state.warnedSkip) {
      state.warnedSkip = true;
      document.getElementById('feedback').textContent =
        'Вы не заполнили ответ. Нажмите «Далее» ещё раз, чтобы пропустить без балла.';
      return;
    }
    state.scores[state.index] = 0;
  } else {
    state.scores[state.index] = evaluateTask(task, ans);
  }

  if (state.index < state.tasks.length - 1) {
    state.index++;
    renderTask();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    submitResults();
  }
}

function isAnswerEmpty(task, ans) {
  if (task.type === 'choice') return ans === null || ans === undefined || ans === '';
  if (task.type === 'input') return ans === null || ans === undefined || String(ans).trim() === '';
  if (task.type === 'truth') {
    if (!ans || !ans.values) return true;
    return ans.values.some(row => row.some(v => v === null || v === undefined));
  }
  if (task.type === 'drag_truth') {
    if (!ans || !ans.values) return true;
    return ans.values.some(row => row.some(v => v === null || v === undefined));
  }
  return true;
}

function evaluateTask(task, ans) {
  if (task.type === 'choice') return ans === task.correct ? 1 : 0;
  if (task.type === 'input') return String(ans).trim().replace(/\s/g, '') === task.correct ? 1 : 0;

  if (task.type === 'truth') {
    for (let r = 0; r < task.rows.length; r++) {
      for (let c = 0; c < task.steps.length; c++) {
        if (ans.values[r][c] !== task.answers[r][c]) return 0;
      }
    }
    return 1;
  }

  if (task.type === 'drag_truth') {
    // Проверка порядка
    for (let i = 0; i < task.steps.length; i++) {
      if (ans.order[i] !== i) return 0;
    }
    // Проверка значений
    for (let r = 0; r < task.rows.length; r++) {
      for (let c = 0; c < task.steps.length; c++) {
        if (ans.values[r][c] !== task.answers[r][c]) return 0;
      }
    }
    return 1;
  }

  return 0;
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
    : 'Не удалось отправить ответы. Сообщите учителю, что работа выполнена.';
}