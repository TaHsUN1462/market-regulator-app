const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Admin password
const ADMIN_PASSWORD = 'admin1234';

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin route with password validation
app.get('/admin', (req, res) => {
  const password = req.query.password;  // get the password from the query string
  if (password === ADMIN_PASSWORD) {  // check if the password is correct
    res.sendFile(path.join(__dirname, 'admin.html'));  // serve the admin page
  } else {
    res.status(403).send('<h1>Access Denied</h1><p>Incorrect password.</p>');  // deny access if password is wrong
  }
});

// Disable direct access to admin.html
app.get('/admin.html', (req, res) => {
  res.status(403).send('<h1>Access Denied</h1><p>Direct access to admin.html is not allowed.</p>');
});

// Fetch products
app.get('/products', (req, res) => {
  const products = JSON.parse(fs.readFileSync('products.json', 'utf-8'));
  res.json(products);
});

// Add product// Add or edit product
app.post('/products', (req, res) => {
  const { name, price, editIndex } = req.body;
  const products = JSON.parse(fs.readFileSync('products.json', 'utf-8'));

  if (editIndex !== null && editIndex !== undefined) {
    // Check if index is valid
    if (products[editIndex]) {
      products[editIndex] = { name, price }; // Update the product at the editIndex
      fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
      return res.send('Product updated successfully.');
    } else {
      return res.status(400).send('Invalid product index.');
    }
  }

  // Add a new product if editIndex is not provided
  if (products.some((product) => product.name.toLowerCase() === name.toLowerCase())) {
    return res.status(400).send('Product already exists.');
  }

  products.push({ name, price });
  fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  res.send('Product added successfully.');
});


// Delete product
app.delete('/products/:name', (req, res) => {
  const { name } = req.params;
  let products = JSON.parse(fs.readFileSync('products.json', 'utf-8'));
  products = products.filter((product) => product.name.toLowerCase() !== name.toLowerCase());
  fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  res.send('Product deleted.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});