const express = require('express');
const {createCategory , showAllCategories} = require('../controller/category');
const {createTag , showAllTags} = require('../controller/tags');
const {auth , isAdmin, isInstructor} = require('../middleware/auth');
const {createCourse , showAllCourses , getCompleteCourseDetails} = require('../controller/course');
const {createSection , deleteSection , updateSection} = require("../controller/section");

const router = express.Router();

router.post('/createCategory' ,auth , isAdmin , createCategory);
router.get('/showAllCategories' , showAllCategories)

router.post('/createCourse' , auth , isInstructor , createCourse);
router.get('/getAllCourses' , auth , showAllCourses);
router.post('/getFullCourseDetails' , auth  , getCompleteCourseDetails);

router.post('/createTag' , auth , isInstructor , createTag);
router.get('/showAllTags' , showAllTags)


router.post('/addSection' , auth , isInstructor , createSection);
router.post('/updateSection' , auth , isInstructor , updateSection);
router.post('/deleteSection' , auth , isInstructor , deleteSection);

module.exports = router;