const express = require('express');
const router = express.Router();

const {createRating , getAllRating , getAllRatingOfaCourse , getAverageRating , markSubsection} = require('../controller/ratingAndReviews');
const {auth , isStudent} = require('../middleware/auth');

router.post('/createRating' , auth , isStudent , createRating);
router.get('/allRating', getAllRating);
router.get('/courseRating' , getAllRatingOfaCourse);
router.get('/averageRating' , getAverageRating);
router.post('/markSubsection' , auth , isStudent , markSubsection);

module.exports = router;