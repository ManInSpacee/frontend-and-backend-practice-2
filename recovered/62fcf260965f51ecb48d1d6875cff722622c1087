const express = require("express");
const https = require("https");
const socketIo = require("socket.io");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// VAPID-ключи — генерируем один раз, храним в vapid.json
const VAPID_FILE = path.join(__dirname, "vapid.json");
let vapidKeys;

if (fs.existsSync(VAPID_FILE)) {
  vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, "utf8"));
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2));
  console.log("VAPID: ключи сгенерированы");
}

webpush.setVapidDetails(
  "mailto:admin@tasks-app.local",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

// HTTPS сервер с сертификатами mkcert
const app = express();
const sslOptions = {
  cert: fs.readFileSync(path.join(__dirname, "localhost+2.pem")),
  key: fs.readFileSync(path.join(__dirname, "localhost+2-key.pem")),
};
const server = https.createServer(sslOptions, app);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./")));

// Push-подписки
let pushSubscriptions = [];

app.post("/subscribe", (req, res) => {
  pushSubscriptions.push(req.body);
  console.log(`Push: подписка добавлена, всего: ${pushSubscriptions.length}`);
  res.status(201).json({ message: "Подписка сохранена" });
});

app.post("/unsubscribe", (req, res) => {
  pushSubscriptions = pushSubscriptions.filter(
    (sub) => sub.endpoint !== req.body.endpoint,
  );
  res.status(200).json({ message: "Подписка удалена" });
});

app.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// ============================================================
// НАПОМИНАНИЯ
// Храним активные таймеры в Map: ключ — id задачи, значение — { timeoutId, text }
// ============================================================

const reminders = new Map();

// Отправляет push всем подписанным пользователям
function sendPush(title, body, reminderId = null) {
  const payload = JSON.stringify({ title, body, reminderId });

  pushSubscriptions.forEach((subscription) => {
    webpush.sendNotification(subscription, payload).catch((err) => {
      if (err.statusCode === 410) {
        pushSubscriptions = pushSubscriptions.filter(
          (s) => s.endpoint !== subscription.endpoint,
        );
      }
    });
  });
}

// Планирует напоминание — запускает таймер на delay миллисекунд
function scheduleReminder(id, text, delay) {
  const timeoutId = setTimeout(() => {
    console.log(`Напоминание: "${text}"`);
    sendPush("Напоминание", text, id);
    reminders.delete(id);
  }, delay);

  reminders.set(id, { timeoutId, text });
}

// Эндпоинт snooze — откладывает напоминание на 5 минут
app.post("/snooze", (req, res) => {
  const reminderId = parseInt(req.query.reminderId, 10);

  if (!reminderId || !reminders.has(reminderId)) {
    return res.status(404).json({ error: "Напоминание не найдено" });
  }

  const reminder = reminders.get(reminderId);

  // Отменяем старый таймер и ставим новый через 5 минут
  clearTimeout(reminder.timeoutId);
  scheduleReminder(reminderId, reminder.text, 5 * 60 * 1000);

  console.log(`Snooze: напоминание "${reminder.text}" отложено на 5 минут`);
  res.status(200).json({ message: "Отложено на 5 минут" });
});

// WebSocket
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`WebSocket: клиент подключён [${socket.id}]`);

  // Обычная задача — рассылаем всем и отправляем push
  socket.on("newTask", (task) => {
    io.emit("taskAdded", task);
    sendPush("Новая задача", task.text);
  });

  // Задача с напоминанием — ставим таймер
  socket.on("newReminder", (reminder) => {
    const { id, text, reminderTime } = reminder;
    const delay = reminderTime - Date.now();

    if (delay <= 0) {
      console.log("Напоминание уже в прошлом, игнорируем");
      return;
    }

    scheduleReminder(id, text, delay);
    console.log(
      `Напоминание запланировано: "${text}" через ${Math.round(delay / 1000)}с`,
    );
  });

  socket.on("disconnect", () => {
    console.log(`WebSocket: клиент отключён [${socket.id}]`);
  });
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`\nСервер запущен: https://localhost:${PORT}`);
  console.log("Нажми Ctrl+C чтобы остановить\n");
});
