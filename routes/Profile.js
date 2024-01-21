const express = require('express');
const {auth} = require('../middleware/auth');
const {updateProfilePhoto , updateProfileData ,getAllUserDetails ,deleteUserPermanently} = require('../controller/profile');
const router = express.Router();

router.put('/updateDisplayPicture' , auth , updateProfilePhoto);
router.put('/updateProfile' , auth , updateProfileData);
router.get('/getUserDetails' , auth , getAllUserDetails);
router.delete('/deleteProfile' , auth , deleteUserPermanently);

module.exports = router;