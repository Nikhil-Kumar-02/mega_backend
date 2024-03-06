const express = require('express');

const router = express.Router();
const {auth ,  isStudent} = require("../middleware/auth");
const { addToCart , removeFromCart } = require('../controller/cart');

router.post("/addToCart" , auth , isStudent , addToCart);
router.post("/removeFromCart" , auth , isStudent , removeFromCart);

module.exports = router;