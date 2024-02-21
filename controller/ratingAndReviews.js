const RatingAndReviews = require('../model/ratingAndReviews');
const Course = require('../model/courses');
const { StatusCodes } = require('http-status-codes');
const { default: mongoose } = require('mongoose');

//createRating
const createRating = async (req,res) => {
    try {
        //fetch data
        const {rating , review , courseId} = req.body;
        const userId = req.user.id;
        //check if user has enrolled or not
        const userAlreadyEnrolled = await Course.findOne({
            _id : courseId , 
            studentsEnrolled : {
                $elemMatch : {
                    $eq : userId,
                }
            }
        });
        if(!userAlreadyEnrolled){
            console.log('you are not enrolled into this course so you cannot review this');
            res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message : 'enroll first to give rating and review'
            })
        }

        //ckeck if user already reviewed the course
        //updated the rating and review model
        const thisUserReview = RatingAndReviews.findOne({
            user : userId , 
            course : courseId
        });

        if(thisUserReview){
            console.log('you have already reviewed this course you can now only edit your review now');
            res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message : 'you have already reviewed this course you can now only edit your review now'
            })
        }
        //create rating and review
        const createdRatingAndReview = await RatingAndReviews.create({
            rating,
            review,
            course : courseId,
            user : userId
        })
        //update course with this rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId , {
            $push : {
                reviewAndRatings : createdRatingAndReview._id
            }
        },{new : true});
        console.log('the updated course is : ', updatedCourseDetails);
        //return response
        res.status(StatusCodes.OK).json({
            message : 'your rating has been sucessfully added to this course thanks for feedback',
            createdRatingAndReview
        })

    } catch (error) {
        console.log('error while creating a rating a review');
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while creating a rating a review',
            error
        })
    }
}

//getAverageRating
const getAverageRating = async (req,res) => {
    try {
        //we are find average rating wrt a course
        //fetch course id
        const {courseId} = req.body;
        //gather all rating on that course
        // const allRandRForCourse = await RatingAndReviews.find({course : courseId});
        // if(allRandRForCourse.length == 0){
        //     //.length used as [] negation wont be true 
        //     res.status(StatusCodes.OK).json({
        //         message : 'no one has given any rating to this course',
        //         rating : 0
        //     })
        // }
        // //we will get array of values so travel and get result
        // let totalRating = 0;
        // for(const eachRandR of allRandRForCourse){
        //     const eachRating = eachRandR.rating;
        //     totalRating = totalRating + parseInt(eachRating);
        // }

        // //calculate the average rating
        // const averageRating = totalRating / allRandRForCourse.length;

        
        //return response
        // res.status(StatusCodes.OK).json({
        //     message : 'average rating for this course calculated',
        //     rating : averageRating,
        // })


        const result = await RatingAndReviews.aggregate([
            {
                $match : {
                    course : new mongoose.Schema.Types.ObjectId(courseId)
                }
            },
            {
                $group : {
                    _id : null,
                    babarWayOfaverageRating : { $avg : "$rating" }
                }
            }
        ]);

        if(result.length > 0){
            res.status(StatusCodes.OK).json({
                message : 'average rating for this course calculated',
                rating : result[0].babarWayOfaverageRating,
            }); 
        }

        res.status(StatusCodes.OK).json({
            message : 'no one has given any rating to this course',
            rating : 0
        });
        
    } catch (error) {
        console.log('error while fetching the average rating');
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while fetching the average rating',
            error
        })
    }
}


//getAllRatingAndReviews
const getAllRating = async (req,res) => {
    try {
        //fetch data
        //generate rating let say any 6
        const generateData = await RatingAndReviews.find({}).sort({rating : 'desc'}).skip(6).limit(6).exec();
        //return res
        res.status(StatusCodes.OK).json({
            message : 'fetched n number of data',
            data : generateData
        })
    } catch (error) {
        console.log('error while fetching all rating');
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while fetching all rating at once',
            error
        })
    }
}


const getAllRatingOfaCourse = async (req,res) => {
    try {
        //fetch data
        const {courseId} = req.body;
        //generate rating let say any 6
        const generateData = await RatingAndReviews.find({course : courseId})
            .sort({rating : 'desc'})
            .skip(6)
            .limit(6)
            .populate({path : 'user' , select : 'firstName lastName email image'})
            .populate({path : 'course' , select : 'courseName'})
            .exec();
        //return res
        res.status(StatusCodes.OK).json({
            message : 'fetched n number of data',
            data : generateData
        })
    } catch (error) {
        console.log('error while fetching all rating');
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while fetching all rating at once',
            error
        })
    }
}

module.exports = {
    createRating , 
    getAverageRating,
    getAllRating , 
    getAllRatingOfaCourse
}