import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());


async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

const users = [];
const products = [
  {
    id: nanoid(6),
    name: "Хлеб Бородинский",
    price: 45,
    category: "Выпечка",
    rating: 5,
    stock: 20,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"
  },
  {
    id: nanoid(6),
    name: "Молоко 3.2%",
    price: 89,
    category: "Молочные продукты",
    rating: 4,
    stock: 15,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400"
  },
  {
    id: nanoid(6),
    name: "Яблоки Гала",
    price: 120,
    category: "Фрукты",
    rating: 4,
    stock: 50,
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400"
  },
  {
    id: nanoid(6),
    name: "Куриная грудка",
    price: 350,
    category: "Мясо",
    rating: 5,
    stock: 10,
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d11d36?w=400"
  },
  {
    id: nanoid(6),
    name: "Паста Barilla",
    price: 95,
    category: "Бакалея",
    rating: 5,
    stock: 30,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400"
  },
  {
    id: nanoid(6),
    name: "Апельсиновый сок",
    price: 130,
    category: "Напитки",
    rating: 4,
    stock: 25,
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400"
  },
];

app.get('api/users', (req, res) => {

})

app.post('/api/auth/register', async (req, res) => {
  
  const { email, first_name, last_name,  password } = req.body;
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({error: "Пользователь с такой почтой уже существует"})
  }
  
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({error: "..."})
  }

  const hashedPassword = await hashPassword(password);

  const newUser = {
    id: nanoid(6),
    email,
    first_name,
    last_name,
    password: hashedPassword
  };

  users.push(newUser);
  res.status(201).json({
    id: newUser.id, 
    email: newUser.email, 
    first_name: newUser.first_name, 
    last_name: newUser.last_name
  })
})


app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({error: "Неверный email или пароль"})
  }
  
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return res.status(401).json({error: "Неверный email или пароль"})
  }
  return res.status(200).json({email: email})
})

app.get('/api/products', (_req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
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

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Товар не найден" });
  res.json(product);
});

app.put('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Товар не найден" });

  Object.assign(product, req.body);
  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Товар не найден" });

  products.splice(index, 1);
  res.json({ message: "Товар удалён" });
});

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
});
