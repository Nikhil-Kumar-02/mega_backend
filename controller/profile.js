const CourseProgress = require('../model/courseProgress');
const Course = require('../model/courses');
const Profile = require('../model/profile');
const User = require('../model/user');
const { StatusCodes } = require('http-status-codes');

//update profile as dummy profile has already been created

const updateProfile = async(req,res) => {
    try {
        //fetch data
        const {gender , dob="" , about=""  , contactNumber=""} = req.body;
        const userId = req.user.id;
        //find the profile then update it
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const updatedProfileDetails = await Profile.findByIdAndUpdate(profileId , {
            gender , dob , contactNumber , about} , {new : true});
        //return response
        res.status(StatusCodes.OK).json({
            message : 'sucessfully updated the user profile',
            updatedProfileDetails
        })
    } catch (error) {
        console.log('error while updating the profile' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while updating the users profile details',
            error 
        })
    }
}


//try to use cron jobs that is schedule eevry delte account to some time that is after a day or so
//learn about task scheduling
const deleteUserPermanently = async (req,res) => {
    try {
        //fetch data
        const userId = req.user.id;

        //validate data
        if(!userId){
            console.log('cannnot find userid while trying to delete user details');
            res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'cannnot find userid while trying to delete user details'
            })
        }

        //first delete the additional user details that this his profile
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        await Profile.findByIdAndDelete(profileId);

        //delete his instances from his course progress
        const allCoursesProgress = userDetails.courseProgress;
        //allCourseProgress will have an array of ids for the user with its progress tracked

        for(const eachCourseProgressId of allCoursesProgress){
            //delete each track of progress made by user
            await CourseProgress.findByIdAndDelete(eachCourseProgressId);
        }

        //then delete his instances from the courses he enrolled
        const allCoursesEnrolled = userDetails.courses;
        //above will be the array of courses where this user is enrolled

        for(const eachCourseId of allCoursesEnrolled){
            //remove this user from the list of student enrolled for this course
            await Course.findByIdAndUpdate(eachCourseId , {
                $pull : {
                    studentsEnrolled : userDetails._id,
                }
            })
        }

        //then detele the user details
        await User.findByIdAndDelete(userDetails._id);

        //return the response
        res.status(StatusCodes.OK).json({
            message : 'your details has been sucessfully delted from the data base'
        })
    } catch (error) {
        console.log('error while deleting a user' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while deleting a user',
            error 
        })
    }
}

const getAllUserDetails = async (req,res) => {
    try {
        const userId = req.user.id;
        const userFullDetails = await User.findById(userId).populate('additionalDetails');
        res.status(StatusCodes.OK).json({
            message : 'data fetched sucesfully',
            userFullDetails,
        })
    } catch (error) {
        console.log('error while fetching the user details', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while trying to fetch the user details',
            error,
        })
    }
}

module.exports = {
    updateProfile ,
    deleteUserPermanently,
    getAllUserDetails
}
