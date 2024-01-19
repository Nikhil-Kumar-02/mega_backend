const express = require('express');
const {auth} = require('../middleware/auth');
const {updateProfilePhoto} = require('../controller/profile');
const router = express.Router();

router.put('/updateDisplayPicture' , auth , updateProfilePhoto);

module.exports = router;