const express = require('express');
const {createCategory , showAllCategories} = require('../controller/category');
const {createTag , showAllTags} = require('../controller/tags');
const {auth , isAdmin, isInstructor} = require('../middleware/auth');
const {createCourse , showAllCourses , getCompleteCourseDetails, editCourse, instructor_user_Courses, delete_instructor_Course} = require('../controller/course');
const {createSection , deleteSection , updateSection} = require("../controller/section");
const {createSubSection , deleteSubsection , updateSubSection} = require('../controller/subsection');

const router = express.Router();

router.post('/createCategory' ,auth , isAdmin , createCategory);
router.get('/showAllCategories' , showAllCategories)

router.post('/createCourse' , auth , isInstructor , createCourse);
// router.post('/editCourse' , auth , isInstructor , editCourse);
router.get('/instructor_user_Courses' , auth , instructor_user_Courses);
router.post('/delete_instructor_Course' , auth , isInstructor ,  delete_instructor_Course);
router.get('/getAllCourses' , showAllCourses);
router.post('/getFullCourseDetails' , getCompleteCourseDetails);

router.post('/createTag' , auth , isInstructor , createTag);
router.get('/showAllTags' , showAllTags)


router.post('/addSection' , auth , isInstructor , createSection);
router.post('/updateSection' , auth , isInstructor , updateSection);
router.post('/deleteSection' , auth , isInstructor , deleteSection);

router.post('/addSubSection' , auth , isInstructor , createSubSection);
router.post('/updateSubSection' , auth , isInstructor , updateSubSection);
router.post('/deleteSubSection' , auth , isInstructor , deleteSubsection);



module.exports = router;