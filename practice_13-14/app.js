const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('tasks-list');
const countEl = document.getElementById('tasks-count');
const emptyState = document.getElementById('empty-state');
const cacheStatus = document.getElementById('cache-status');
const statusEl = document.getElementById('status');

function loadTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function render() {
  const tasks = loadTasks();
  list.innerHTML = '';
  countEl.textContent = tasks.length;

  if (tasks.length === 0) {
    emptyState.classList.add('visible');
    return;
  }

  emptyState.classList.remove('visible');

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' task-item--done' : '');

    li.innerHTML = `
      <span class="task-index">${String(index + 1).padStart(2, '0')}.</span>
      <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} data-index="${index}">
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="btn-delete" data-index="${index}">DEL</button>
    `;

    list.appendChild(li);
  });
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const tasks = loadTasks();
  tasks.push({ text, done: false });
  saveTasks(tasks);
  input.value = '';
  render();
});

list.addEventListener('change', (e) => {
  if (!e.target.classList.contains('task-checkbox')) return;
  const index = Number(e.target.dataset.index);
  const tasks = loadTasks();
  tasks[index].done = e.target.checked;
  saveTasks(tasks);
  render();
});

list.addEventListener('click', (e) => {
  if (!e.target.classList.contains('btn-delete')) return;
  const index = Number(e.target.dataset.index);
  const tasks = loadTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  render();
});

window.addEventListener('online', () => {
  statusEl.textContent = 'ONLINE';
  statusEl.className = 'status status--online';
});

window.addEventListener('offline', () => {
  statusEl.textContent = 'OFFLINE';
  statusEl.className = 'status status--offline';
});

if (!navigator.onLine) {
  statusEl.textContent = 'OFFLINE';
  statusEl.className = 'status status--offline';
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      cacheStatus.textContent = 'SERVICE WORKER: АКТИВЕН // ' + reg.scope;
    } catch (err) {
      cacheStatus.textContent = 'SERVICE WORKER: ОШИБКА РЕГИСТРАЦИИ';
      console.error(err);
    }
  });
} else {
  cacheStatus.textContent = 'SERVICE WORKER: НЕ ПОДДЕРЖИВАЕТСЯ';
}

render();
