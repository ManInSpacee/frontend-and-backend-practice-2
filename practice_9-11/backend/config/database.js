import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'database.json');

const seedData = {
  users: [
    {
      id: 1,
      email: 'admin@pcparts.com',
      first_name: 'Алексей',
      last_name: 'Смирнов',
      password: bcrypt.hashSync('admin1234', 10),
      role: 'admin',
      blocked: false,
    },
    {
      id: 2,
      email: 'seller@pcparts.com',
      first_name: 'Дмитрий',
      last_name: 'Козлов',
      password: bcrypt.hashSync('seller1234', 10),
      role: 'seller',
      blocked: false,
    },
    {
      id: 3,
      email: 'user@pcparts.com',
      first_name: 'Иван',
      last_name: 'Петров',
      password: bcrypt.hashSync('user1234', 10),
      role: 'user',
      blocked: false,
    },
  ],
  products: [
    { id: 1, name: 'Intel Core i9-14900K', category: 'Процессор', description: '24 ядра (8P+16E), до 6.0 ГГц, Socket LGA1700, TDP 125W', price: 42990, stock: 8 },
    { id: 2, name: 'AMD Ryzen 9 7950X', category: 'Процессор', description: '16 ядер / 32 потока, до 5.7 ГГц, Socket AM5, TDP 170W', price: 38500, stock: 5 },
    { id: 3, name: 'NVIDIA GeForce RTX 4090', category: 'Видеокарта', description: '24 ГБ GDDR6X, 16384 CUDA ядер, TDP 450W', price: 149990, stock: 3 },
    { id: 4, name: 'AMD Radeon RX 7900 XTX', category: 'Видеокарта', description: '24 ГБ GDDR6, 6144 потоковых процессоров, TDP 355W', price: 89990, stock: 4 },
    { id: 5, name: 'ASUS ROG MAXIMUS Z790', category: 'Материнская плата', description: 'Socket LGA1700, DDR5, Wi-Fi 6E, PCIe 5.0, ATX', price: 34990, stock: 6 },
    { id: 6, name: 'MSI MAG X670E TOMAHAWK', category: 'Материнская плата', description: 'Socket AM5, DDR5, Wi-Fi 6E, PCIe 5.0, ATX', price: 22990, stock: 7 },
    { id: 7, name: 'Kingston Fury Beast DDR5-6000', category: 'Оперативная память', description: '32 ГБ (2x16 ГБ), DDR5-6000 МГц, CL36, XMP 3.0', price: 9990, stock: 20 },
    { id: 8, name: 'Corsair Dominator Platinum DDR5', category: 'Оперативная память', description: '64 ГБ (2x32 ГБ), DDR5-5600 МГц, CL36', price: 18990, stock: 12 },
    { id: 9, name: 'Samsung 990 Pro 2TB', category: 'SSD накопитель', description: 'NVMe PCIe 4.0, чтение 7450 МБ/с, запись 6900 МБ/с, M.2 2280', price: 14990, stock: 15 },
    { id: 10, name: 'WD Black SN850X 1TB', category: 'SSD накопитель', description: 'NVMe PCIe 4.0, чтение 7300 МБ/с, запись 6600 МБ/с, M.2 2280', price: 9490, stock: 18 },
    { id: 11, name: 'be quiet! Dark Power 13 1000W', category: 'Блок питания', description: '1000W, 80+ Titanium, модульный, ATX 3.0, PCIe 5.0', price: 19990, stock: 9 },
    { id: 12, name: 'Fractal Design Torrent', category: 'Корпус', description: 'ATX, 4x140mm вентилятора, боковое стекло, отличный airflow', price: 12990, stock: 11 },
  ],
  nextUserId: 4,
  nextProductId: 13,
};

export function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Ошибка чтения БД:', e.message);
  }
  return JSON.parse(JSON.stringify(seedData));
}

export function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

if (!fs.existsSync(DB_PATH)) {
  saveDB(seedData);
}
