const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { register, login, getAllUsers } = require('../controllers/authController');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/users', protect, getAllUsers);

module.exports = router;