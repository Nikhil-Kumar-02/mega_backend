const express = require('express');
const {createCategory , showAllCategories} = require('../controller/category');
const {auth , isAdmin} = require('../middleware/auth');
const router = express.Router();

router.post('/createCategory' ,auth , isAdmin , createCategory)
router.get('/showAllCategories' , showAllCategories)

module.exports = router;