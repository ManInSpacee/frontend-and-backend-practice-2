import express from 'express';
const app = express();
const port = 3000;

let products = [
  {id: 1, name: 'Milk', price: 12},
  {id: 2, name: 'Bread', price: 21},
  {id: 3, name: 'Cheese', price: 30},
]
app.use(express.json());

app.get('/'
  , (req, res) => {
    res.send('Главная страница');
  });

// CRUD
app.post('/products'
  , (req, res) => {
    const { name, price } = req.body;
    const newProduct = {
      id: Date.now(),
      name,
      price,
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
  });

app.get('/products'
  , (req, res) => {
    res.send(JSON.stringify(products));
  });

app.get('/products/:id'
  , (req, res) => {
    let product = products.find(product => product.id == req.params.id);
    res.send(JSON.stringify(product));
  });

app.patch('/products/:id'
  , (req, res) => {
    const product = products.find(product => product.id == req.params.id);
    const { name, price } = req.body;
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.name = name;
    res.json(product);
  });

app.delete('/products/:id'
  , (req, res) => {
    products = products.filter(product => product.id != req.params.id);
    res.send('Ok');
  });



app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});


