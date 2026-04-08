const appContent     = document.getElementById('app-content');
const btnHome        = document.getElementById('btn-home');
const btnAbout       = document.getElementById('btn-about');
const swStatus       = document.getElementById('sw-status');
const statusEl       = document.getElementById('status');
const btnPushEnable  = document.getElementById('btn-push-enable');
const btnPushDisable = document.getElementById('btn-push-disable');

const socket = io('https://localhost:3002');

socket.on('connect', () => console.log('WebSocket: подключён'));

socket.on('taskAdded', (task) => {
  showToast(`Новая задача: ${task.text}`);
});

async function loadPage(page) {
  try {
    const response = await fetch(`/content/${page}.html`);
    const html     = await response.text();
    appContent.innerHTML = html;
    if (page === 'home') initTasks();
  } catch (err) {
    appContent.innerHTML = `<p class="error-msg">// ошибка загрузки страницы</p>`;
  }
}

function setActiveNav(activeBtn) {
  [btnHome, btnAbout].forEach(btn => btn.classList.remove('nav-btn--active'));
  activeBtn.classList.add('nav-btn--active');
}

btnHome.addEventListener('click',  () => { setActiveNav(btnHome);  loadPage('home'); });
btnAbout.addEventListener('click', () => { setActiveNav(btnAbout); loadPage('about'); });

loadPage('home');

function initTasks() {
  const form         = document.getElementById('task-form');
  const input        = document.getElementById('task-input');
  const reminderForm = document.getElementById('reminder-form');
  const reminderText = document.getElementById('reminder-text');
  const reminderTime = document.getElementById('reminder-time');
  const list         = document.getElementById('tasks-list');
  const countEl      = document.getElementById('tasks-count');
  const emptyState   = document.getElementById('empty-state');

  function getTasks()       { return JSON.parse(localStorage.getItem('tasks') || '[]'); }
  function saveTasks(tasks) { localStorage.setItem('tasks', JSON.stringify(tasks)); }
  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderTasks() {
    const tasks = getTasks();
    countEl.textContent = tasks.length;
    list.innerHTML      = '';

    if (tasks.length === 0) { emptyState.classList.add('visible'); return; }
    emptyState.classList.remove('visible');

    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' task-item--done' : '');

      const reminderHtml = task.reminder
        ? `<span class="task-reminder">// ${new Date(task.reminder).toLocaleString()}</span>`
        : '';

      li.innerHTML = `
        <span class="task-index">${String(index + 1).padStart(2, '0')}.</span>
        <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} data-index="${index}">
        <span class="task-text">${escapeHtml(task.text)}${reminderHtml}</span>
        <button class="btn-delete" data-index="${index}">DEL</button>
      `;
      list.appendChild(li);
    });
  }

  function addTask(text, reminderTimestamp = null) {
    const tasks   = getTasks();
    const newTask = { id: Date.now(), text, done: false, reminder: reminderTimestamp };
    tasks.push(newTask);
    saveTasks(tasks);
    renderTasks();

    if (reminderTimestamp) {
      // Сервер поставит setTimeout и пришлёт push в нужное время
      socket.emit('newReminder', { id: newTask.id, text, reminderTime: reminderTimestamp });
    } else {
      socket.emit('newTask', { text, timestamp: Date.now() });
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTask(text);
    input.value = '';
  });

  reminderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text      = reminderText.value.trim();
    const datetime  = reminderTime.value;
    if (!text || !datetime) return;

    const timestamp = new Date(datetime).getTime();
    if (timestamp <= Date.now()) { alert('Дата должна быть в будущем'); return; }

    addTask(text, timestamp);
    reminderText.value = '';
    reminderTime.value = '';
  });

  list.addEventListener('change', (e) => {
    if (!e.target.classList.contains('task-checkbox')) return;
    const index = Number(e.target.dataset.index);
    const tasks = getTasks();
    tasks[index].done = e.target.checked;
    saveTasks(tasks);
    renderTasks();
  });

  list.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn-delete')) return;
    const index = Number(e.target.dataset.index);
    const tasks = getTasks();
    tasks.splice(index, 1);
    saveTasks(tasks);
    renderTasks();
  });

  renderTasks();
}

function base64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output  = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

async function subscribeToPush() {
  const keyResponse   = await fetch('https://localhost:3002/vapid-public-key');
  const { publicKey } = await keyResponse.json();
  const registration  = await navigator.serviceWorker.ready;
  const subscription  = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64ToUint8Array(publicKey),
  });
  await fetch('https://localhost:3002/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
}

async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  await fetch('https://localhost:3002/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });
  await subscription.unsubscribe();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      swStatus.textContent = 'SW: АКТИВЕН // ' + reg.scope;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        btnPushEnable.style.display  = 'none';
        btnPushDisable.style.display = 'inline-block';
      }
    } catch (err) {
      swStatus.textContent = 'SW: ОШИБКА РЕГИСТРАЦИИ';
    }
  });
} else {
  swStatus.textContent = 'SW: НЕ ПОДДЕРЖИВАЕТСЯ';
}

btnPushEnable.addEventListener('click', async () => {
  if (Notification.permission === 'denied') { alert('Уведомления заблокированы.'); return; }
  if (Notification.permission === 'default') {
    const p = await Notification.requestPermission();
    if (p !== 'granted') { alert('Нужно разрешить уведомления.'); return; }
  }
  try {
    await subscribeToPush();
    btnPushEnable.style.display  = 'none';
    btnPushDisable.style.display = 'inline-block';
  } catch { alert('Не удалось подписаться'); }
});

btnPushDisable.addEventListener('click', async () => {
  await unsubscribeFromPush();
  btnPushDisable.style.display = 'none';
  btnPushEnable.style.display  = 'inline-block';
});

window.addEventListener('online',  () => { statusEl.textContent = 'ONLINE';  statusEl.className = 'status status--online'; });
window.addEventListener('offline', () => { statusEl.textContent = 'OFFLINE'; statusEl.className = 'status status--offline'; });
if (!navigator.onLine) { statusEl.textContent = 'OFFLINE'; statusEl.className = 'status status--offline'; }

function showToast(message) {
  const toast = document.createElement('div');
  toast.className   = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast--visible'));
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}