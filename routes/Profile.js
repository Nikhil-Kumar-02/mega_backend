const express = require('express');
const {auth , isInstructor} = require('../middleware/auth');
const {updateProfilePhoto , updateProfileData ,getAllUserDetails ,deleteUserPermanently, getUserEnrolledCourses , instructorDashboard} = require('../controller/profile');
const router = express.Router();

router.put('/updateDisplayPicture' , auth , updateProfilePhoto);
router.put('/updateProfile' , auth , updateProfileData);
router.get('/getUserDetails' , auth , getAllUserDetails);
router.delete('/deleteProfile' , auth , deleteUserPermanently);
router.get('/userEnrolledCourses' , auth , getUserEnrolledCourses)
router.get('/instructorStats' , auth , isInstructor , instructorDashboard);

module.exports = router;