const express = require('express');
const router = express.Router();

const {createRating , getAllRating , getAllRatingOfaCourse , getAverageRating} = require('../controller/ratingAndReviews');
const {auth , isStudent} = require('../middleware/auth');

router.post('/createRating' , auth , isStudent , createRating);
router.get('/allRating', getAllRating);
router.get('/courseRating' , getAllRatingOfaCourse);
router.get('/averageRating' , getAverageRating);

module.exports = router;