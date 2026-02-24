import express from 'express';
import { nanoid } from "nanoid";
import cors from 'cors'

const app = express();
const port = 3000;


let products = [
  // Выпечка
  { id: nanoid(6),
    name: 'Хлеб Бородинский',
    price: 45,
    category: 'Выпечка',
    rating: 5,
    stock: 0,
    image: 'https://main-cdn.sbermegamarket.ru/big1/hlr-system/-12/062/166/734/715/7/100074219340b0.jpg' },
  { id: nanoid(6), name: 'Багет французский', price: 70, category: 'Выпечка', rating: 4, stock: 15, image: 'https://images.unsplash.com/photo-1597079910443-60c43fc4f729?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Круассан классический', price: 90, category: 'Выпечка', rating: 5, stock: 10, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Булочка с корицей', price: 65, category: 'Выпечка', rating: 4, stock: 0, image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Чиабатта', price: 85, category: 'Выпечка', rating: 5, stock: 8, image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Пончик глазированный', price: 55, category: 'Выпечка', rating: 3, stock: 30, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&auto=format&fit=crop' },

  // Молочные продукты
  { id: nanoid(6), name: 'Молоко 3.2%', price: 95, category: 'Молочка', rating: 4, stock: 45, image: 'https://images.unsplash.com/photo-1563636619-e91000f21fca?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Творог 9%', price: 140, category: 'Молочка', rating: 5, stock: 12, image: 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Сметана 20%', price: 85, category: 'Молочка', rating: 4, stock: 25, image: 'https://images.unsplash.com/photo-1528750955925-53f58e7851d8?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Сыр Гауда', price: 450, category: 'Молочка', rating: 5, stock: 7, image: 'https://images.unsplash.com/photo-1486297678162-ad2a19b05840?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Масло сливочное', price: 180, category: 'Молочка', rating: 5, stock: 18, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Кефир 1%', price: 75, category: 'Молочка', rating: 3, stock: 50, image: 'https://images.unsplash.com/photo-1523473827533-2a64d0d36748?q=80&w=400&auto=format&fit=crop' },

  // Мясо и рыба
  { id: nanoid(6), name: 'Куриное филе', price: 380, category: 'Мясо', rating: 5, stock: 22, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Говяжий стейк', price: 850, category: 'Мясо', rating: 5, stock: 5, image: 'https://images.unsplash.com/photo-1546248136-247558115bdf?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Фарш домашний', price: 320, category: 'Мясо', rating: 4, stock: 14, image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Стейк лосося', price: 1200, category: 'Мясо', rating: 5, stock: 3, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Креветки', price: 950, category: 'Мясо', rating: 4, stock: 10, image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Колбаса Докторская', price: 420, category: 'Мясо', rating: 4, stock: 20, image: 'https://images.unsplash.com/photo-1624161339931-4196f743f3e8?q=80&w=400&auto=format&fit=crop' },

  // Фрукты и Овощи
  { id: nanoid(6), name: 'Яблоки Ред', price: 120, category: 'Фрукты/Овощи', rating: 4, stock: 60, image: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Бананы Эквадор', price: 110, category: 'Фрукты/Овощи', rating: 5, stock: 100, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Помидоры Черри', price: 190, category: 'Фрукты/Овощи', rating: 4, stock: 15, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Огурцы пупырчатые', price: 145, category: 'Фрукты/Овощи', rating: 4, stock: 40, image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d02d?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Авокадо Хасс', price: 160, category: 'Фрукты/Овощи', rating: 5, stock: 12, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Перец Болгарский', price: 230, category: 'Фрукты/Овощи', rating: 4, stock: 8, image: 'https://images.unsplash.com/photo-1566245357845-92097a346e22?q=80&w=400&auto=format&fit=crop' },

  // Напитки и Сладости
  { id: nanoid(6), name: 'Кофе молотый', price: 550, category: 'Напитки', rating: 5, stock: 25, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Чай черный', price: 320, category: 'Напитки', rating: 4, stock: 35, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Сок апельсиновый', price: 135, category: 'Напитки', rating: 3, stock: 20, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Шоколад темный', price: 110, category: 'Сладости', rating: 5, stock: 45, image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Мед цветочный', price: 480, category: 'Сладости', rating: 5, stock: 6, image: 'https://images.unsplash.com/photo-1589135340847-59a4adb3020d?q=80&w=400&auto=format&fit=crop' },
  { id: nanoid(6), name: 'Вафли венские', price: 155, category: 'Сладости', rating: 4, stock: 14, image: 'https://images.unsplash.com/photo-1562329265-95a6d7a83440?q=80&w=400&auto=format&fit=crop' }
];


app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // именно порт фронтенда
  methods: ["GET","POST","PATCH","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}));



const logger = (req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
}

app.use(logger);


// GET /api/products
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.patch("/api/products/:id", (req, res) => {
  let id = req.params.id;
  const newName = req.body.name.trim();
  const newPrice = Number(req.body.price);
  const newCategory = req.body.category;
  const newRating = Number(req.body.rating);
  const newStock = Number(req.body.stock);
  const newImage = req.body.image.trim();

  const productIndex = products.findIndex(product => product.id === id);

  if (productIndex !== -1) {
    products[productIndex].name = newName;
    products[productIndex].price = newPrice;
    products[productIndex].category = newCategory;
    products[productIndex].rating = newRating;
    products[productIndex].stock = newStock;
    products[productIndex].image = newImage;
    res.status(201).json({ message: "Карточка обновлена успешно"});
  } else {
    res.status(404).json({ message: "Карточка не найдена"});
  }
})

// POST /api/products
app.post("/api/products", (req, res) => {
  const { name, price, category, rating, stock, image } = req.body;
  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    price: Number(price),
    category: category.trim(),
    rating: Number(rating),
    stock: Number(stock),
    image: image.trim()
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});


app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const productIndex = products.findIndex(product => product.id === id);
  if (productIndex === -1) {
    res.status(404).json({ message: "Товар не найден"});
  }
  products.splice(productIndex, 1);

  res.json({message: "Продукт успешно удалён"});

})


// 404 для всех остальных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});
// Глобальный обработчик ошибок (чтобы сервер не падал)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});
// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});