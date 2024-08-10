const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Product = require('../models/Product');

const router = express.Router();

// @route    POST /api/products
// @desc     Add a new product
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('price', 'Price is required').isNumeric(),
      check('quantity', 'Quantity is required').isInt({ min: 0 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, quantity } = req.body;

    try {
      const newProduct = new Product({
        name,
        description,
        price,
        quantity,
      });

      const product = await newProduct.save();
      res.json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    GET /api/products
// @desc     Get all products with pagination and population
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const products = await Product.paginate({}, {
      page,
      limit,
      populate: {
        path: 'relatedField', 
        select: 'name description' // Select specific fields if needed
      }
    });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    PUT /api/products/:id
// @desc     Update a product
router.put('/:id', auth, async (req, res) => {
  const { name, description, price, quantity } = req.body;

  const productFields = {};
  if (name) productFields.name = name;
  if (description) productFields.description = description;
  if (price) productFields.price = price;
  if (quantity || quantity === 0) productFields.quantity = quantity;

  try {
    let product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productFields },
      { new: true }
    );

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/products/:id
// @desc     Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
