const express = require('express');
const cors = require("cors")
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

app.use(cors())
// Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/products', require('./routes/products'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => res.send('API Running'));

module.exports = app;
