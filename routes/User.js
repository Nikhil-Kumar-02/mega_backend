const express = require('express');
const {generateOpt, signup , userLogin} = require('../controller/auth');
const validateSignUpData = require('../utils/signUpValidator')
const router = express.Router();

router.post('/sendotp' , generateOpt);
router.post('/signup' , validateSignUpData , signup);
router.post('/login' , userLogin);



module.exports = router;