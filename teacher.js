'use strict';

/* ==========================================================
   КОНФИГУРАЦИЯ
   ========================================================== */

// URL развернутого веб-приложения Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyF2x-qnIPerEebab8j4PXEr_U7csUGruQROCLgsKYGRUgeBvMjiHnBSEfpGhE881Wk/exec';

// Список тем по классам.
// id = идентификатор листа в Google Sheets (work)
const TOPICS = {
  '7': [
    {
      id: '7-1sm',
      title: 'Самостоятельная работа 1 · Аппаратное обеспечение и файловая система',
      path: '7grade/1sm/index.html'
    }
  ],
  '8': [
    {
      id: '8-2sm',
      title: 'Самостоятельная работа 1 · Логика и таблицы истинности',
      path: '8grade/2sm/index.html'
    }
  ],
  '9': [
    // сюда можно добавлять темы для 9 класса
  ]
};

/* ==========================================================
   DOM
   ========================================================== */

const el = {
  gradeSelect:    document.getElementById('gradeSelect'),
  topicSelect:    document.getElementById('topicSelect'),
  showLinkBtn:    document.getElementById('showLinkBtn'),
  linkBox:        document.getElementById('linkBox'),
  studentLink:    document.getElementById('studentLink'),
  copyLinkBtn:    document.getElementById('copyLinkBtn'),
  refreshBtn:     document.getElementById('refreshBtn'),
  resultsStatus:  document.getElementById('resultsStatus'),
  tableWrap:      document.getElementById('tableWrap'),
  resultsBody:    document.getElementById('resultsBody')
};

/* ==========================================================
   СОСТОЯНИЕ
   ========================================================== */

let currentGrade = null;
let currentTopic = null;

/* ==========================================================
   СПИСОК ТЕМ
   ========================================================== */

function updateTopicOptions() {
  const grade = el.gradeSelect.value;
  currentGrade = grade;
  currentTopic = null;

  el.topicSelect.innerHTML = '';
  el.showLinkBtn.disabled = true;
  el.linkBox.hidden = true;

  if (!grade) {
    el.topicSelect.disabled = true;
    el.topicSelect.innerHTML = '<option value="">— сначала выберите класс —</option>';
    return;
  }

  const topics = TOPICS[grade] || [];
  if (topics.length === 0) {
    el.topicSelect.disabled = true;
    el.topicSelect.innerHTML = '<option value="">— для этого класса пока нет тем —</option>';
    return;
  }

  el.topicSelect.disabled = false;
  el.topicSelect.innerHTML = '<option value="">— выберите тему —</option>';
  topics.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.title;
    el.topicSelect.appendChild(opt);
  });
}

function updateShowLinkButton() {
  const grade = el.gradeSelect.value;
  const topicId = el.topicSelect.value;
  const topics = TOPICS[grade] || [];
  const topic = topics.find(t => t.id === topicId);

  if (topic) {
    currentTopic = topic;
    el.showLinkBtn.disabled = false;
  } else {
    currentTopic = null;
    el.showLinkBtn.disabled = true;
    el.linkBox.hidden = true;
  }
}

/* ==========================================================
   ПОКАЗ ССЫЛКИ
   ========================================================== */

function showStudentLink() {
  if (!currentTopic) return;

  const base = window.location.href.replace(/[^/]*$/, ''); // убираем имя файла
  const fullUrl = base + currentTopic.path;

  el.studentLink.value = fullUrl;
  el.linkBox.hidden = false;

  el.linkBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ==========================================================
   КОПИРОВАНИЕ ССЫЛКИ
   ========================================================== */

function copyStudentLink() {
  const input = el.studentLink;
  input.select();
  input.setSelectionRange(0, 99999);

  try {
    navigator.clipboard.writeText(input.value).then(() => {
      const original = el.copyLinkBtn.textContent;
      el.copyLinkBtn.textContent = '✅ Скопировано';
      setTimeout(() => { el.copyLinkBtn.textContent = original; }, 1500);
    }).catch(() => {
      document.execCommand('copy');
    });
  } catch (e) {
    document.execCommand('copy');
  }
}

/* ==========================================================
   ЗАГРУЗКА РЕЗУЛЬТАТОВ ИЗ GOOGLE SHEETS
   ========================================================== */

function loadResults() {
  el.resultsStatus.textContent = 'Загрузка данных…';
  el.resultsStatus.hidden = false;
  el.tableWrap.hidden = true;
  el.resultsBody.innerHTML = '';

  if (!currentTopic) {
    el.resultsStatus.textContent = 'Сначала выберите класс и тему, затем нажмите «Обновить».';
    return;
  }

  const url = SCRIPT_URL
    + '?work=' + encodeURIComponent(currentTopic.id)
    + '&t=' + Date.now(); // кэш-бастер

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(rows => {
      if (!Array.isArray(rows) || rows.length === 0) {
        el.resultsStatus.textContent = 'Пока нет ни одной выполненной работы по этой теме.';
        el.resultsStatus.hidden = false;
        el.tableWrap.hidden = true;
        return;
      }

      // Фильтрация по классу (на случай, если в листе есть данные разных классов)
      let filtered = rows;
      if (currentGrade) {
        filtered = rows.filter(r => String(r['Класс'] || '').trim() === currentGrade);
      }

      if (filtered.length === 0) {
        el.resultsStatus.textContent = 'Для выбранного класса пока нет результатов.';
        el.resultsStatus.hidden = false;
        el.tableWrap.hidden = true;
        return;
      }

      renderResultsTable(filtered);
      el.resultsStatus.hidden = true;
      el.tableWrap.hidden = false;
    })
    .catch(err => {
      console.error(err);
      el.resultsStatus.textContent =
        'Ошибка загрузки данных. Проверьте, что веб-приложение развернуто с доступом «Все» и URL указан верно.';
      el.resultsStatus.hidden = false;
      el.tableWrap.hidden = true;
    });
}

/* ==========================================================
   ТАБЛИЦА РЕЗУЛЬТАТОВ
   ========================================================== */

function renderResultsTable(rows) {
  const columns = [
    'Дата', 'Фамилия', 'Имя', 'Класс', 'Буква',
    'З1', 'З2', 'З3', 'З4', 'З5', 'З6',
    'З7', 'З8', 'З9', 'З10', 'З11', 'З12',
    'Итого', 'Оценка'
  ];

  el.resultsBody.innerHTML = '';

  rows.forEach(row => {
    const tr = document.createElement('tr');

    columns.forEach(col => {
      const td = document.createElement('td');
      let value = row[col];

      if (col === 'Дата' && value instanceof Date) {
        value = value.toLocaleString('ru-RU', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      }

      if (value === undefined || value === null) value = '';

      td.textContent = value;

      if (col === 'Оценка') {
        const mark = Number(value);
        if (mark === 5) td.classList.add('mark-5');
        else if (mark === 4) td.classList.add('mark-4');
        else if (mark === 3) td.classList.add('mark-3');
        else if (mark === 2) td.classList.add('mark-2');
      }

      tr.appendChild(td);
    });

    el.resultsBody.appendChild(tr);
  });
}

/* ==========================================================
   СОБЫТИЯ
   ========================================================== */

el.gradeSelect.addEventListener('change', () => {
  updateTopicOptions();
  updateShowLinkButton();
});

el.topicSelect.addEventListener('change', updateShowLinkButton);

el.showLinkBtn.addEventListener('click', showStudentLink);

el.copyLinkBtn.addEventListener('click', copyStudentLink);

el.refreshBtn.addEventListener('click', loadResults);

/* ==========================================================
   СТАРТ
   ========================================================== */

el.resultsStatus.textContent =
  'Выберите класс и тему, затем нажмите «Обновить», чтобы загрузить результаты.';
