fetch('http://localhost:3000/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Oranges',
    price: 1018212
  })
})

.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

