const express = require('express');
const {generateOpt} = require('../controller/auth')
const router = express.Router();

router.post('/sendotp' , generateOpt);

module.exports = router;