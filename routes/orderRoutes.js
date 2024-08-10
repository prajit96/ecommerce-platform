const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Course = require('../models/Course');

const router = express.Router();

// @route    GET /api/orders
// @desc     Get all orders (Admin)
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const orders = await Order.find().populate('items.product').populate('items.course');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/orders/my
// @desc     Get orders for logged-in user
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product').populate('items.course');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    PUT /api/orders/:id
// @desc     Update order status (Admin)
router.put('/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ msg: 'Access denied' });
  }

  const { paymentStatus } = req.body;

  try {
    let order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { paymentStatus } },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
