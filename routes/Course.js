const express = require('express');
const {createCategory , showAllCategories} = require('../controller/category');
const {createTag , showAllTags} = require('../controller/tags');
const {auth , isAdmin, isInstructor} = require('../middleware/auth');
const {createCourse , showAllCourses} = require('../controller/course')
const router = express.Router();

router.post('/createCategory' ,auth , isAdmin , createCategory);
router.get('/showAllCategories' , showAllCategories)

router.post('/createCourse' , auth , isInstructor , createCourse)

router.post('/createTag' , auth , isInstructor , createTag);
router.get('/showAllTags' , showAllTags)



module.exports = router;