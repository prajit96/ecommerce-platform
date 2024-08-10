const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Course = require('../models/Course');

const router = express.Router();

// @route    POST /api/courses
// @desc     Add a new course
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('instructor', 'Instructor ID is required').not().isEmpty(),
      check('price', 'Price is required').isNumeric(),
      check('duration', 'Duration is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, instructor, price, duration } = req.body;

    try {
      const newCourse = new Course({
        title,
        description,
        instructor,
        price,
        duration,
      });

      const course = await newCourse.save();
      res.json(course);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    GET /api/courses
// @desc     Get all courses with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const courses = await Course.paginate({}, {
      page,
      limit,
      populate: {
        path: 'instructor',
        select: 'name email'
      }
    });

    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    PUT /api/courses/:id
// @desc     Update a course
router.put('/:id', auth, async (req, res) => {
  const { title, description, instructor, price, duration } = req.body;

  const courseFields = {};
  if (title) courseFields.title = title;
  if (description) courseFields.description = description;
  if (instructor) courseFields.instructor = instructor;
  if (price) courseFields.price = price;
  if (duration) courseFields.duration = duration;

  try {
    let course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ msg: 'Course not found' });

    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: courseFields },
      { new: true }
    );

    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/courses/:id
// @desc     Delete a course
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    await Course.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Course removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
