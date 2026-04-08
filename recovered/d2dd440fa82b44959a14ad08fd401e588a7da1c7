const express    = require('express');
const https      = require('https');
const socketIo   = require('socket.io');
const webpush    = require('web-push');
const bodyParser = require('body-parser');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');

// ============================================================
// VAPID-КЛЮЧИ
//
// VAPID — это подпись сервера для push-уведомлений.
// Браузер проверяет её и знает, что уведомление пришло от нас.
//
// При первом запуске генерируем ключи и сохраняем в vapid.json.
// При следующих запусках — просто читаем из файла.
// ============================================================

const VAPID_FILE = path.join(__dirname, 'vapid.json');

let vapidKeys;

if (fs.existsSync(VAPID_FILE)) {
  vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf8'));
  console.log('VAPID: ключи загружены из vapid.json');
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2));
  console.log('VAPID: ключи сгенерированы и сохранены в vapid.json');
}

webpush.setVapidDetails(
  'mailto:admin@tasks-app.local', // email нужен для идентификации — любой валидный
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// ============================================================
// EXPRESS — HTTP сервер
// ============================================================

const app    = express();

// Читаем сертификаты которые сгенерировали через mkcert
const sslOptions = {
  cert: fs.readFileSync(path.join(__dirname, 'localhost+2.pem')),
  key:  fs.readFileSync(path.join(__dirname, 'localhost+2-key.pem')),
};

const server = https.createServer(sslOptions, app);

app.use(cors());
app.use(bodyParser.json());

// Раздаём статику из текущей папки (index.html, app.js, sw.js и т.д.)
app.use(express.static(path.join(__dirname, './')));

// ============================================================
// PUSH-ПОДПИСКИ
//
// Когда пользователь нажимает "Включить уведомления":
//   1. Браузер создаёт подписку через PushManager
//   2. Клиент отправляет подписку сюда (POST /subscribe)
//   3. Мы храним её в массиве
//   4. При новой задаче — рассылаем push всем из массива
//
// В реальном приложении подписки хранились бы в базе данных.
// ============================================================

let pushSubscriptions = [];

// Клиент подписывается
app.post('/subscribe', (req, res) => {
  pushSubscriptions.push(req.body);
  console.log(`Push: новая подписка, всего: ${pushSubscriptions.length}`);
  res.status(201).json({ message: 'Подписка сохранена' });
});

// Клиент отписывается
app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  pushSubscriptions = pushSubscriptions.filter(sub => sub.endpoint !== endpoint);
  console.log(`Push: отписка, осталось: ${pushSubscriptions.length}`);
  res.status(200).json({ message: 'Подписка удалена' });
});

// Клиент запрашивает публичный ключ для создания подписки
app.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// ============================================================
// SOCKET.IO — WebSocket соединения
//
// Когда пользователь добавляет задачу:
//   1. Клиент отправляет событие 'newTask' на сервер
//   2. Сервер рассылает 'taskAdded' всем подключённым клиентам
//   3. Каждая открытая вкладка показывает всплывашку
//   4. Параллельно сервер отправляет push закрытым браузерам
// ============================================================

const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  console.log(`WebSocket: клиент подключён [${socket.id}]`);

  socket.on('newTask', (task) => {
    console.log(`WebSocket: новая задача — "${task.text}"`);

    // Рассылаем событие всем подключённым клиентам (включая отправителя)
    io.emit('taskAdded', task);

    // Отправляем push-уведомление всем подписанным пользователям
    sendPushToAll(task.text);
  });

  socket.on('disconnect', () => {
    console.log(`WebSocket: клиент отключён [${socket.id}]`);
  });
});

// Отправляет push всем подпискам, удаляет невалидные
function sendPushToAll(taskText) {
  const payload = JSON.stringify({
    title: 'Новая задача',
    body:  taskText,
  });

  pushSubscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, payload)
      .catch(err => {
        console.error(`Push: ошибка отправки (${err.statusCode})`);

        // 410 Gone — подписка больше не существует (пользователь отписался через браузер)
        // Удаляем её из нашего массива
        if (err.statusCode === 410) {
          pushSubscriptions = pushSubscriptions.filter(
            sub => sub.endpoint !== subscription.endpoint
          );
        }
      });
  });
}

// ============================================================
// ЗАПУСК
// ============================================================

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`\nСервер запущен: https://localhost:${PORT}`);
  console.log('Нажми Ctrl+C чтобы остановить\n');
});
