'use strict';

/* ==========================================================
   ⚠️ ВСТАВЬТЕ ЗДЕСЬ URL ВЕБ-ПРИЛОЖЕНИЯ GOOGLE APPS SCRIPT
   ========================================================== */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyF2x-qnIPerEebab8j4PXEr_U7csUGruQROCLgsKYGRUgeBvMjiHnBSEfpGhE881Wk/exec';

/* ==========================================================
   ПУЛЫ ДАННЫХ
   ========================================================== */

const INPUT_DEVICES   = ['Клавиатура', 'Мышь', 'Микрофон', 'Сканер', 'Веб-камера', 'Тачпад', 'Джойстик', 'Графический планшет'];
const OUTPUT_DEVICES  = ['Монитор', 'Принтер', 'Колонки', 'Наушники', 'Плоттер', 'Проектор'];
const INTERNAL_DEVICES = ['Процессор', 'Оперативная память', 'Жёсткий диск', 'Видеокарта', 'Материнская плата', 'SSD-накопитель', 'Кулер'];
const EXTERNAL_DEVICES = ['Клавиатура', 'Мышь', 'Монитор', 'Принтер', 'Сканер', 'Веб-камера', 'Внешний диск', 'USB-флешка'];
const RAM_DEVICES     = ['Оперативная память (RAM)', 'DDR', 'DIMM', 'DRAM'];
const STORAGE_DEVICES = ['Жёсткий диск (HDD)', 'SSD-накопитель', 'USB-флешка', 'SD-карта', 'DVD-диск', 'Blu-Ray'];
const PORTS           = ['USB', 'HDMI', 'VGA', 'PS/2', 'Ethernet', 'Разъём 3.5 мм Jack', 'DisplayPort'];
const NOT_PORTS       = ['Клавиатура', 'Монитор', 'Процессор', 'Принтер', 'Мышь', 'Оперативная память'];

const TOP_FOLDERS = ['Документы', 'Музыка', 'Проекты', 'Работа', 'Учёба', 'Игры', 'Фото', 'Видео', 'Загрузки', 'Архив'];
const SUB_FOLDERS = ['2023', '2024', '2025', 'Лето', 'Зима', 'Ретро', 'Хиты', 'Поп', 'Рок', 'Отчёты', 'Личное', 'Друзья', 'Школа', 'ДЗ', 'Математика', 'Химия'];
const FILE_NAMES = ['report.docx', 'song.mp3', 'photo.jpg', 'план.txt', 'note.txt', 'video.mp4', 'data.xlsx', 'presentation.pptx', 'setup.exe', 'logo.png', 'ДЗ.txt', 'конспект.docx'];

/* ==========================================================
   УТИЛИТЫ
   ========================================================== */

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

/* ==========================================================
   ГЕНЕРАЦИЯ ЗАДАНИЙ
   ========================================================== */

function generateTasks() {
  const tasks = [];

  /* ---------- ЗАДАНИЕ 1: ввод / вывод ---------- */
  {
    const isInput = Math.random() < 0.5;
    const device = isInput ? pick(INPUT_DEVICES) : pick(OUTPUT_DEVICES);
    tasks.push({
      topic: 'Аппаратное обеспечение',
      instruction: `Определите: устройство «${device}» является устройством ввода или вывода информации?`,
      type: 'choice',
      options: shuffle(['Устройство ввода', 'Устройство вывода']),
      correct: isInput ? 'Устройство ввода' : 'Устройство вывода'
    });
  }

  /* ---------- ЗАДАНИЕ 2: внутреннее / внешнее ---------- */
  {
    const isInternal = Math.random() < 0.5;
    const device = isInternal ? pick(INTERNAL_DEVICES) : pick(EXTERNAL_DEVICES);
    tasks.push({
      topic: 'Аппаратное обеспечение',
      instruction: `Устройство «${device}» — внутреннее (внутри системного блока) или внешнее?`,
      type: 'choice',
      options: shuffle(['Внутреннее', 'Внешнее']),
      correct: isInternal ? 'Внутреннее' : 'Внешнее'
    });
  }

  /* ---------- ЗАДАНИЕ 3: оперативная / долговременная ---------- */
  {
    const isRam = Math.random() < 0.5;
    const device = isRam ? pick(RAM_DEVICES) : pick(STORAGE_DEVICES);
    tasks.push({
      topic: 'Аппаратное обеспечение',
      instruction: `«${device}» — это оперативная (временная) или долговременная (постоянная) память?`,
      type: 'choice',
      options: shuffle(['Оперативная (временная)', 'Долговременная (постоянная)']),
      correct: isRam ? 'Оперативная (временная)' : 'Долговременная (постоянная)'
    });
  }

  /* ---------- ЗАДАНИЕ 4: мультивыбор — все устройства ввода ИЛИ вывода ---------- */
  {
    const wantInput = Math.random() < 0.5;
    const pool = wantInput ? INPUT_DEVICES : OUTPUT_DEVICES;
    const otherPool = wantInput ? OUTPUT_DEVICES : INPUT_DEVICES;

    const correctList = pickN(pool, 3);
    const wrongList = pickN(otherPool, 2);
    const all = shuffle([...correctList, ...wrongList]);

    tasks.push({
      topic: 'Аппаратное обеспечение',
      instruction: `Выберите ВСЕ устройства ${wantInput ? 'ВВОДА' : 'ВЫВОДА'} информации.`,
      type: 'multi',
      options: all,
      correct: correctList
    });
  }

  /* ---------- ЗАДАНИЕ 5: мультивыбор — все ПОРТЫ ---------- */
  {
    const correctList = pickN(PORTS, 3);
    const wrongList = pickN(NOT_PORTS, 2);
    const all = shuffle([...correctList, ...wrongList]);

    tasks.push({
      topic: 'Аппаратное обеспечение',
      instruction: 'Выберите ВСЕ порты (разъёмы) компьютера.',
      type: 'multi',
      options: all,
      correct: correctList
    });
  }

  /* ---------- ЗАДАНИЕ 6: порт или не порт ---------- */
  {
    const isPort = Math.random() < 0.5;
    const item = isPort ? pick(PORTS) : pick(NOT_PORTS);
    tasks.push({
      topic: 'Аппаратное обеспечение',
      instruction: `«${item}» — это порт (разъём) компьютера?`,
      type: 'choice',
      options: shuffle(['Да, это порт', 'Нет, это не порт']),
      correct: isPort ? 'Да, это порт' : 'Нет, это не порт'
    });
  }

  /* ---------- Общая структура дерева для заданий файловой системы ---------- */
  const tree = generateFsTree();

  /* ---------- ЗАДАНИЕ 7: правильный полный путь ---------- */
  {
    const { path, top, sub, file } = randomFileInTree(tree);
    const wrong1 = 'C:\\' + top + '\\' + file;
    const wrong2 = 'C:\\' + sub + '\\' + file;
    const wrong3 = 'C:\\' + top + '\\' + sub + '\\' + 'other_' + file;
    const options = shuffle([path, wrong1, wrong2, wrong3]);
    tasks.push({
      topic: 'Файловая система',
      instruction: `Файл «${file}» лежит в папке «${sub}», которая вложена в папку «${top}» на диске C. Выберите правильный полный путь к файлу.`,
      type: 'choice',
      options,
      correct: path
    });
  }

  /* ---------- ЗАДАНИЕ 8: спуск вниз ---------- */
  {
    const { top, sub } = randomSubInTree(tree);
    tasks.push({
      topic: 'Файловая система',
      instruction: `Вы находитесь в папке C:\\${top}. Вы спустились на один уровень вниз в папку «${sub}». Где вы оказались?`,
      type: 'choice',
      options: shuffle([
        `C:\\${top}\\${sub}`,
        `C:\\${sub}`,
        `C:\\`,
        `C:\\${top}`
      ]),
      correct: `C:\\${top}\\${sub}`
    });
  }

  /* ---------- ЗАДАНИЕ 9: подъём вверх ---------- */
  {
    const { top, sub } = randomSubInTree(tree);
    tasks.push({
      topic: 'Файловая система',
      instruction: `Вы находитесь в папке C:\\${top}\\${sub}. Вы поднялись на один уровень вверх. Где вы оказались?`,
      type: 'choice',
      options: shuffle([
        `C:\\${top}`,
        `C:\\${sub}`,
        `C:\\`,
        `C:\\${top}\\${sub}`
      ]),
      correct: `C:\\${top}`
    });
  }

  /* ---------- ЗАДАНИЕ 10: многошаговая история ---------- */
  {
    // Строим историю: старт в папке, потом N переходов
    const topA = pick(TOP_FOLDERS);
    const subA = pick(SUB_FOLDERS);
    const subB = pick(SUB_FOLDERS.filter(s => s !== subA));
    const subC = pick(SUB_FOLDERS.filter(s => s !== subA && s !== subB));
    const fileName = pick(FILE_NAMES);

    // Сценарий: старт C:\A\X → вниз в Y → вверх → вниз в Z → файл
    // Итог: C:\A\Z\файл
    const startPath = `C:\\${topA}\\${subA}`;
    const history = `Старт в папке ${startPath}. Затем спустились на один уровень вниз в папку «${subB}», поднялись на один уровень вверх, спустились в папку «${subC}» и нашли там файл «${fileName}».`;
    const correctPath = `C:\\${topA}\\${subC}\\${fileName}`;

    tasks.push({
      topic: 'Файловая система',
      instruction: history + ' Запишите правильный полный путь к файлу.',
      type: 'choice',
      options: shuffle([
        correctPath,
        `C:\\${topA}\\${subB}\\${fileName}`,
        `C:\\${topA}\\${subA}\\${subC}\\${fileName}`,
        `C:\\${subC}\\${fileName}`
      ]),
      correct: correctPath
    });
  }

  /* ---------- ЗАДАНИЕ 11: дерево каталогов ---------- */
  {
    const treeText = renderTreeAsText(tree);
    const { file, parentName } = randomFileWithParent(tree);
    const allFolders = collectAllFolderNames(tree);
    const wrongOptions = pickN(allFolders.filter(n => n !== parentName), 3);
    tasks.push({
      topic: 'Файловая система',
      instruction: `Рассмотрите дерево каталогов и определите, в какой папке лежит файл «${file}».`,
      type: 'choice',
      tree: treeText,
      options: shuffle([parentName, ...wrongOptions]),
      correct: parentName
    });
  }

  /* ---------- ЗАДАНИЕ 12: правильный путь по дереву ---------- */
  {
    const { path, file } = randomFileInTree(tree);
    const parts = path.replace(/^C:\\/, '').replace(/\\[^\\]+$/, '').split('\\');
    const wrong1 = 'C:\\' + shuffle(parts).join('\\') + '\\' + file;
    const wrong2 = 'C:\\' + parts.slice(0, -1).join('\\') + '\\' + file;
    const wrong3 = 'C:\\' + parts[parts.length - 1] + '\\' + file;
    tasks.push({
      topic: 'Файловая система',
      instruction: `Рассмотрите дерево каталогов. Выберите правильный полный путь к файлу «${file}».`,
      type: 'choice',
      tree: renderTreeAsText(tree),
      options: shuffle([path, wrong1, wrong2, wrong3]),
      correct: path
    });
  }

  return tasks;
}

/* ==========================================================
   ДЕРЕВО ФАЙЛОВОЙ СИСТЕМЫ
   ========================================================== */

function generateFsTree() {
  const root = { name: 'C:', children: [], isFile: false };
  const usedTop = pickN(TOP_FOLDERS, randInt(2, 3));

  usedTop.forEach(topName => {
    const top = { name: topName, children: [], isFile: false };
    const usedSub = pickN(SUB_FOLDERS, randInt(1, 2));
    usedSub.forEach(subName => {
      const sub = { name: subName, children: [], isFile: false };
      const usedFiles = pickN(FILE_NAMES, randInt(1, 2));
      usedFiles.forEach(f => sub.children.push({ name: f, isFile: true }));
      top.children.push(sub);
    });
    root.children.push(top);
  });

  return root;
}

function renderTreeAsText(node) {
  const lines = [];
  function walk(n, prefix, isLast) {
    if (n === node) {
      lines.push('C:\\');
    } else {
      lines.push(prefix + (isLast ? '└── ' : '├── ') + n.name + (n.isFile ? '' : '\\'));
    }
    if (n.children && n.children.length) {
      const newPrefix = (n === node) ? '' : prefix + (isLast ? '    ' : '│   ');
      n.children.forEach((ch, i) => walk(ch, newPrefix, i === n.children.length - 1));
    }
  }
  walk(node, '', true);
  return lines.join('\n');
}

function collectAllPaths(node, current = [], out = []) {
  if (node.isFile) {
    out.push({
      path: 'C:\\' + [...current, node.name].join('\\'),
      file: node.name,
      parent: current[current.length - 1] || '',
      parentParts: [...current]
    });
    return out;
  }
  const next = node.name === 'C:' ? current : [...current, node.name];
  node.children.forEach(ch => collectAllPaths(ch, next, out));
  return out;
}

function collectAllFolderNames(node, out = []) {
  if (!node.isFile && node.name !== 'C:') out.push(node.name);
  if (node.children) node.children.forEach(ch => collectAllFolderNames(ch, out));
  return out;
}

function randomFileInTree(tree) {
  const all = collectAllPaths(tree);
  const f = pick(all);
  return {
    path: f.path,
    file: f.file,
    top: f.parentParts[0],
    sub: f.parentParts[1]
  };
}

function randomSubInTree(tree) {
  const allFolders = [];
  function walk(n, current) {
    if (n.isFile) return;
    const next = n.name === 'C:' ? current : [...current, n.name];
    if (n.name !== 'C:' && current.length > 0) {
      allFolders.push({ top: current[0], sub: n.name });
    }
    n.children.forEach(ch => walk(ch, next));
  }
  walk(tree, []);
  return pick(allFolders);
}

function randomFileWithParent(tree) {
  const all = collectAllPaths(tree);
  const f = pick(all);
  return { file: f.file, parentName: f.parent };
}

/* ==========================================================
   СОСТОЯНИЕ
   ========================================================== */

const state = {
  student: { lastName: '', firstName: '', grade: '', letter: '' },
  tasks: [],
  index: 0,
  answers: [],   // массив: для choice — строка или null; для multi — массив выбранных
  scores: [],    // 0/1
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

  if (!ln || !fn || !gr || !lt) {
    alert('Заполните все поля.');
    return;
  }

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

  if (task.tree) {
    html += `<pre class="tree-view">${escapeHtml(task.tree)}</pre>`;
  }

  if (task.type === 'choice') {
    html += '<div class="options" id="options">';
    task.options.forEach(opt => {
      html += `<button type="button" class="option" data-value="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`;
    });
    html += '</div>';
  } else if (task.type === 'multi') {
    html += '<div class="palette" id="palette">';
    task.options.forEach(opt => {
      html += `<button type="button" class="card-chip" data-value="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`;
    });
    html += '</div>';
  }

  html += '<div class="feedback" id="feedback"></div>';
  html += `<div class="actions">
             <button type="button" class="btn btn-primary" id="nextBtn">
               ${state.index === state.tasks.length - 1 ? 'Завершить и отправить' : 'Далее →'}
             </button>
           </div>`;

  el.taskCard.innerHTML = html;

  // Хранилище текущего ответа
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
  } else if (task.type === 'multi') {
    state.answers[state.index] = [];
    document.querySelectorAll('.card-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.value;
        const cur = state.answers[state.index];
        const i = cur.indexOf(v);
        if (i === -1) { cur.push(v); btn.classList.add('selected'); }
        else { cur.splice(i, 1); btn.classList.remove('selected'); }
        document.getElementById('feedback').textContent = '';
      });
    });
  }

  document.getElementById('nextBtn').addEventListener('click', onNext);
}

function updateProgress() {
  const total = state.tasks.length;
  el.progressText.textContent = `Задание ${state.index + 1} из ${total}`;
  el.progressFill.style.width = `${((state.index) / total) * 100}%`;
}

/* ==========================================================
   ПЕРЕХОД / ПРОВЕРКА
   ========================================================== */

function checkCurrent() {
  const task = state.tasks[state.index];
  const ans = state.answers[state.index];

  if (task.type === 'choice') {
    return ans === task.correct;
  } else if (task.type === 'multi') {
    if (!Array.isArray(ans) || ans.length === 0) return false;
    const correctSet = new Set(task.correct);
    const ansSet = new Set(ans);
    if (correctSet.size !== ansSet.size) return false;
    for (const c of correctSet) if (!ansSet.has(c)) return false;
    return true;
  }
  return false;
}

function onNext() {
  const task = state.tasks[state.index];
  const ans = state.answers[state.index];
  const isEmpty = task.type === 'choice'
    ? ans === null || ans === undefined
    : !Array.isArray(ans) || ans.length === 0;

  if (isEmpty && !state.warnedSkip) {
    state.warnedSkip = true;
    document.getElementById('feedback').textContent =
      'Вы не выбрали ответ. Нажмите «Далее» ещё раз, чтобы пропустить без балла.';
    return;
  }

  const score = isEmpty ? 0 : (checkCurrent() ? 1 : 0);
  state.scores[state.index] = score;

  if (state.index < state.tasks.length - 1) {
    state.index++;
    renderTask();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    submitResults();
  }
}

/* ==========================================================
   ОТПРАВКА В GOOGLE SHEETS
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
    lastName: state.student.lastName,
    firstName: state.student.firstName,
    grade: state.student.grade,
    letter: state.student.letter,
    date: dateStr,
    scores: state.scores,
    total: total
  };

  // Отправляем без ожидания ответа (no-cors)
  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  })
    .then(() => showDone(true, total))
    .catch(() => showDone(false, total));
}

function showDone(ok, total) {
  state.submitted = true;
  el.screenQuiz.hidden = true;
  el.screenDone.hidden = false;

  el.finishEmoji.textContent = ok ? '✅' : '⚠️';
  el.finishTitle.textContent = ok ? 'Ответы отправлены' : 'Проблема с отправкой';
  el.finishText.textContent = ok
    ? 'Спасибо! Ваши ответы переданы учителю. Оценку вы узнаете от учителя.'
    : 'Не удалось отправить ответы. Сообщите учителю, что работа выполнена (ваш результат сохранён локально).';
}
