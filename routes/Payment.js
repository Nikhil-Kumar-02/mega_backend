const express = require('express');

const router = express.Router();
const {auth , isAdmin , isInstructor , isStudent} = require("../middleware/auth");
const { capturePayment , verifyPayment } = require('../controller/payments');

router.post("/capturePayment" , auth , isStudent , capturePayment);
router.post("/verifyPayment" , auth , isStudent , verifyPayment);

module.exports = router;