const express = require('express');
const {generateOpt, signup} = require('../controller/auth');
const validateSignUpData = require('../utils/signUpValidator')
const router = express.Router();

router.post('/sendotp' , generateOpt);
router.post('/signup' , validateSignUpData , signup);

module.exports = router;