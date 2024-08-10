const express = require('express');
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Bill = require('../models/Bill');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product').populate('items.course');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    let totalAmount = 0;
    const items = [];

    // Validate product quantities and calculate total amount
    for (let item of cart.items) {
      if (item.product) {
        const product = await Product.findById(item.product._id);
        if (!product) {
          return res.status(400).json({ msg: `Product ${item.product.name} not found` });
        }
        if (product.quantity < item.quantity) {
          return res.status(400).json({ msg: `Product ${item.product.name} is out of stock` });
        }
        if (isNaN(product.price)) {
          return res.status(400).json({ msg: `Product ${item.product.name} has an invalid price` });
        }
        totalAmount += product.price * item.quantity;
        items.push({ itemType: 'Product', item: item.product._id });
      } else if (item.course) {
        const course = await Course.findById(item.course._id);
        if (!course) {
          return res.status(400).json({ msg: `Course ${item.course.title} not found` });
        }
        if (isNaN(course.price)) {
          return res.status(400).json({ msg: `Course ${item.course.title} has an invalid price` });
        }
        totalAmount += course.price;
        items.push({ itemType: 'Course', item: item.course._id });
      }
    }

    // Example tax and discount calculations
    const taxes = totalAmount * 0.1; // 10% tax
    const discounts = totalAmount * 0.05; // 5% discount
    const finalAmount = totalAmount + taxes - discounts;

    // Create a new order
    const order = new Order({
      user: req.user.id,
      items: cart.items,
      totalAmount,
      paymentStatus: 'Paid', // In a real scenario, this would be set after successful payment
    });

    await order.save();

    // Create a new bill
    const bill = new Bill({
      user: req.user.id,
      items: items,
      totalAmount,
      taxes,
      discounts,
      finalAmount
    });

    await bill.save();

    // Update product quantities
    for (let item of cart.items) {
      if (item.product) {
        const product = await Product.findById(item.product._id);
        product.quantity -= item.quantity;
        await product.save();
      }
    }

    // Clear the user's cart
    cart.items = [];
    await cart.save();

    res.json({ order, bill });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
