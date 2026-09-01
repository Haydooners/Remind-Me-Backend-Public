const express = require('express');
const { createUser, loginUser, getUser } = require('../controllers/auth_controller.js');
const router = express.Router();

router.post('/createUser', createUser);
router.post('/loginUser', loginUser);
router.get('/getUser', getUser);

module.exports = router;