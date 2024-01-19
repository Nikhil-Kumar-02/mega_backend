const express = require('express');
const courseRoute = require('../Course');
const paymentRoute = require('../Payment');
const userRoute = require('../User');
const profileRoute = require('../Profile');

const router = express.Router();

router.use('/auth' , userRoute);
router.use('/profile' , profileRoute);
router.use('/course' , courseRoute);
router.use('/payment' , paymentRoute);

module.exports = router;