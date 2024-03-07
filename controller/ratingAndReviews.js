const RatingAndReviews = require('../model/ratingAndReviews');
const Course = require('../model/courses');
const { StatusCodes } = require('http-status-codes');
const { default: mongoose, Mongoose } = require('mongoose');
const NewCourseProgress = require("../model/NewCourseProgress");

//createRating
const createRating = async (req,res) => {
    try {
        //fetch data
        console.log("rached rating : " , req.body);
        const {rating , review , courseId} = req.body;
        const userId = req.user.id;
        const objectUserId = new mongoose.Types.ObjectId(userId)
        //check if user has enrolled or not
        console.log("the user id is " , objectUserId );
        const userAlreadyEnrolled = await Course.findById(courseId);

        // const userAlreadyEnrolled = await Course.findOne({
        //     _id : courseId , 
        //     studentsEnrolled : {
        //         $elemMatch : {
        //             $eq : userId,
        //         }
        //     }
        // });

        console.log("the user is : " , userAlreadyEnrolled);

        //unenrolled student cant give rebiew thing not checked
        if(!userAlreadyEnrolled.studentsEnrolled.includes(userId)){
            console.log('you are not enrolled into this course so you cannot review this');
            return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message : 'Enroll first to give rating and review'
            })
        }

        //ckeck if user already reviewed the course
        //updated the rating and review model
        const thisUserReview = await RatingAndReviews.findOne({
            user : userId , 
            course : courseId
        });

        console.log("the already given rating is : " , thisUserReview);

        if(thisUserReview){
            console.log('you have already reviewed this course you can now only edit your review now');
            return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message : 'Already Rated the course'
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
        return res.status(StatusCodes.OK).json({
            message : 'your rating has been sucessfully added to this course thanks for feedback',
            createdRatingAndReview
        })

    } catch (error) {
        console.log('error while creating a rating a review' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'Error while creating a rating a review',
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
            return res.status(StatusCodes.OK).json({
                message : 'Average rating for this course calculated',
                rating : result[0].babarWayOfaverageRating,
            }); 
        }

        return res.status(StatusCodes.OK).json({
            message : 'No one has given any rating to this course',
            rating : 0
        });
        
    } catch (error) {
        console.log('error while fetching the average rating');
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'Error while fetching the average rating',
            error
        })
    }
}


//getAllRatingAndReviews
const getAllRating = async (req,res) => {
    try {
        //fetch data
        //generate rating let say any 6
        const generateData = await RatingAndReviews.find({}).sort({rating : 'desc'})
        // .skip(6)
        .limit(6).exec();
        //return res
        return res.status(StatusCodes.OK).json({
            message : 'fetched n number of data',
            data : generateData
        })
    } catch (error) {
        console.log('error while fetching all rating');
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
            // .skip(6)
            .limit(6)
            .populate({path : 'user' , select : 'firstName lastName email image'})
            .populate({path : 'course' , select : 'courseName'})
            .exec();
        //return res
        return res.status(StatusCodes.OK).json({
            message : 'fetched 6 user top rating and review data',
            data : generateData
        })
    } catch (error) {
        console.log('error while fetching all rating');
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while fetching all rating of a course at once',
            error
        })
    }
}

const markSubsection = async (req,res) => {
    try {
        console.log("the data in req : " , req.body);
        const {courseId , subsectionId} = req.body;
        const userId = req.user.id;

        if(!courseId){
            //we have to return all the course progress of this student
            const allProgress = await NewCourseProgress.find({userId});
            console.log("the user all progress : " , allProgress);
            return res.status(StatusCodes.OK).json({
                message : "user all progress",
                allProgress
            })
        }

        //first find the course preogress entry regarding this courseid and userid 
        //if this subsection does not exits then insert this and return updated result
        let dataFound = await NewCourseProgress.findOne({courseId , userId});

        console.log("the user found course progress is : " , dataFound);

        if(!dataFound){
            return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message : 'You cannot mark the Courses' , 
                description : "this can be because during payment empty course progress for that courseid and userid was not intialized"
            })
        }

        if(!subsectionId){
            return res.status(StatusCodes.OK).json({
                message : "the seen lectures are these",
                dataFound
            })
        }

        if(dataFound.completedVideos.includes(subsectionId)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message : "Course already marked",
                description : 'This subsection is present in the conpleted list of subsections'
            })
        }

        dataFound.completedVideos.push(subsectionId);
        dataFound = await dataFound.save();

        return res.status(StatusCodes.OK).json({
            message : "Marked sucessfully",
            dataFound,
        })

    } catch (error) {
        console.log("error while pushing a subsection into course progress " , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "error while marking a Subsection",
        })
    }
}

module.exports = {
    createRating , 
    getAverageRating,
    getAllRating , 
    getAllRatingOfaCourse,
    markSubsection,
}