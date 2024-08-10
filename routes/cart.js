const express = require('express');
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Course = require('../models/Course');
const Product = require('../models/Product');

const router = express.Router();

// @route    POST /api/cart
// @desc     Add item to cart
router.post('/', auth, async (req, res) => {
  const { courseId, productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check for duplicate courses
    if (courseId) {
      if (cart.items.some(item => item.course && item.course.toString() === courseId)) {
        return res.status(400).json({ msg: 'Course already in cart' });
      }
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ msg: 'Course not found' });
      }
      cart.items.push({ course: courseId, quantity: 1 });
    }

    // Check for duplicate products
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }
      const existingProduct = cart.items.find(item => item.product && item.product.toString() === productId);
      if (existingProduct) {
        existingProduct.quantity += quantity || 1;
        if (existingProduct.quantity > product.quantity) {
          return res.status(400).json({ msg: 'Requested quantity exceeds available stock' });
        }
      } else {
        if (quantity > product.quantity) {
          return res.status(400).json({ msg: 'Requested quantity exceeds available stock' });
        }
        cart.items.push({ product: productId, quantity: quantity || 1 });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/cart
// @desc     Get cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.course', 'title description')
      .populate('items.product', 'name description quantity');

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    PUT /api/cart/:itemId
// @desc     Update item quantity in cart
router.put('/:itemId', auth, async (req, res) => {
  const { quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    const item = cart.items.find(item => item._id.toString() === req.params.itemId);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }

    if (item.product) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }
      if (quantity > product.quantity) {
        return res.status(400).json({ msg: 'Requested quantity exceeds available stock' });
      }
    }

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/cart/:itemId
// @desc     Remove item from cart
router.delete('/:itemId', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
