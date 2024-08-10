const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getUserProfile);

module.exports = router;
