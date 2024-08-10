const express = require('express');
const auth = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Course = require('../models/Course');
const Product = require('../models/Product');

const router = express.Router();

// @route    POST /api/wishlist
// @desc     Add item to wishlist
router.post('/', auth, async (req, res) => {
  const { courseId, productId } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, items: [] });
    }

    // Check for duplicate courses
    if (courseId) {
      if (wishlist.items.some(item => item.course && item.course.toString() === courseId)) {
        return res.status(400).json({ msg: 'Course already in wishlist' });
      }
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ msg: 'Course not found' });
      }
      wishlist.items.push({ course: courseId });
    }

    // Check for duplicate products
    if (productId) {
      if (wishlist.items.some(item => item.product && item.product.toString() === productId)) {
        return res.status(400).json({ msg: 'Product already in wishlist' });
      }
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }
      wishlist.items.push({ product: productId });
    }

    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/wishlist
// @desc     Get wishlist
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items.course', 'title description')
      .populate('items.product', 'name description');

    if (!wishlist) {
      return res.status(404).json({ msg: 'Wishlist not found' });
    }

    res.json(wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/wishlist/:itemId
// @desc     Remove item from wishlist
router.delete('/:itemId', auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({ msg: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
