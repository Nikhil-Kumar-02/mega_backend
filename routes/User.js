const express = require('express');
const router = express.Router();
const {generateOpt, signup , userLogin} = require('../controller/auth');
const validateSignUpData = require('../utils/signUpValidator');
const {resetPasswordToken , resetPassword} = require('../controller/resetPassword')
const {auth} = require('../middleware/auth')

router.post('/sendotp' , generateOpt);
router.post('/signup' , validateSignUpData , signup);
router.post('/login' , userLogin);

router.post('/reset-password-token' ,auth , resetPasswordToken);
router.post('/reset-password' ,auth , resetPassword);



module.exports = router;