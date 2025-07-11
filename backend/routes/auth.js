const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, validateSession } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/validate-session', validateSession);

module.exports = router; 