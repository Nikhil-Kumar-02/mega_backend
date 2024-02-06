const express = require('express');
const {auth} = require('../middleware/auth');
const {updateProfilePhoto , updateProfileData ,getAllUserDetails ,deleteUserPermanently, getUserEnrolledCourses} = require('../controller/profile');
const router = express.Router();

router.put('/updateDisplayPicture' , auth , updateProfilePhoto);
router.put('/updateProfile' , auth , updateProfileData);
router.get('/getUserDetails' , auth , getAllUserDetails);
router.delete('/deleteProfile' , auth , deleteUserPermanently);
router.get('/userEnrolledCourses' , auth , getUserEnrolledCourses)

module.exports = router;