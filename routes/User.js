const express = require('express');
const router = express.Router();
const {generateOpt, signup , userLogin , updatePassword} = require('../controller/auth');
const validateSignUpData = require('../utils/signUpValidator');
const {resetPasswordToken , resetPassword} = require('../controller/resetPassword')
const {auth} = require('../middleware/auth')

router.post('/sendotp' , generateOpt);
router.post('/signup' , validateSignUpData , signup);
router.post('/login' , userLogin);
router.put('/updatePassword' , auth , updatePassword);

router.post('/reset-password-token' , resetPasswordToken);
router.post('/reset-password' , resetPassword);



module.exports = router;