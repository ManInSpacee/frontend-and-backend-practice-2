const appContent = document.getElementById("app-content");
const btnHome = document.getElementById("btn-home");
const btnAbout = document.getElementById("btn-about");
const swStatus = document.getElementById("sw-status");
const statusEl = document.getElementById("status");

async function loadPage(page) {
  try {
    const response = await fetch(`/content/${page}.html`);
    const html = await response.text();
    appContent.innerHTML = html;
    if (page === "home") initTasks();
  } catch (err) {
    appContent.innerHTML = `<p class="error-msg">// ошибка загрузки страницы</p>`;
    console.error("loadPage error:", err);
  }
}

function setActiveNav(activeBtn) {
  [btnHome, btnAbout].forEach((btn) => btn.classList.remove("nav-btn--active"));
  activeBtn.classList.add("nav-btn--active");
}

btnHome.addEventListener("click", () => {
  setActiveNav(btnHome);
  loadPage("home");
});
btnAbout.addEventListener("click", () => {
  setActiveNav(btnAbout);
  loadPage("about");
});

loadPage("home");

function initTasks() {
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const list = document.getElementById("tasks-list");
  const countEl = document.getElementById("tasks-count");
  const emptyState = document.getElementById("empty-state");

  function getTasks() {
    return JSON.parse(localStorage.getItem("tasks") || "[]");
  }
  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderTasks() {
    const tasks = getTasks();
    countEl.textContent = tasks.length;
    list.innerHTML = "";

    if (tasks.length === 0) {
      emptyState.classList.add("visible");
      return;
    }
    emptyState.classList.remove("visible");

    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = "task-item" + (task.done ? " task-item--done" : "");
      li.innerHTML = `
        <span class="task-index">${String(index + 1).padStart(2, "0")}.</span>
        <input type="checkbox" class="task-checkbox" ${task.done ? "checked" : ""} data-index="${index}">
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="btn-delete" data-index="${index}">DEL</button>
      `;
      list.appendChild(li);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const tasks = getTasks();
    tasks.push({ text, done: false });
    saveTasks(tasks);
    input.value = "";
    renderTasks();
  });

  list.addEventListener("change", (e) => {
    if (!e.target.classList.contains("task-checkbox")) return;
    const index = Number(e.target.dataset.index);
    const tasks = getTasks();
    tasks[index].done = e.target.checked;
    saveTasks(tasks);
    renderTasks();
  });

  list.addEventListener("click", (e) => {
    if (!e.target.classList.contains("btn-delete")) return;
    const index = Number(e.target.dataset.index);
    const tasks = getTasks();
    tasks.splice(index, 1);
    saveTasks(tasks);
    renderTasks();
  });

  renderTasks();
}

window.addEventListener("online", () => {
  statusEl.textContent = "ONLINE";
  statusEl.className = "status status--online";
});
window.addEventListener("offline", () => {
  statusEl.textContent = "OFFLINE";
  statusEl.className = "status status--offline";
});
if (!navigator.onLine) {
  statusEl.textContent = "OFFLINE";
  statusEl.className = "status status--offline";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      swStatus.textContent = "SW: АКТИВЕН // " + reg.scope;
    } catch (err) {
      swStatus.textContent = "SW: ОШИБКА РЕГИСТРАЦИИ";
      console.error("SW registration error:", err);
    }
  });
} else {
  swStatus.textContent = "SW: НЕ ПОДДЕРЖИВАЕТСЯ";
}
