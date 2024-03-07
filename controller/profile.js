const NewCourseProgress = require('../model/NewCourseProgress');
const Course = require('../model/courses');
const Profile = require('../model/profile');
const User = require('../model/user');
const { StatusCodes } = require('http-status-codes');
const cloudinaryFileUpload = require('../utils/imageUploader');
require('dotenv').config();

//update profile as dummy profile has already been created

const updateProfileData = async(req,res) => {
    try {
        //fetch data
        const {gender , dob="" , about=""  , phoneNumber=""} = req.body;
        const userId = req.user.id;
        //find the profile then update it
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const updatedProfileDetails = await Profile.findByIdAndUpdate(profileId , {
            gender , dob , contactNumber : phoneNumber , about} , {new : true});
        //return response
        return res.status(StatusCodes.OK).json({
            message : 'sucessfully updated the user profile',
            updatedProfileDetails
        })
    } catch (error) {
        console.log('error while updating the profile' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while updating the users profile details',
            error 
        })
    }
}

const updateProfilePhoto = async (req,res) => {
    try {
        console.log("the req is  " , req?.files)
        const {displayPicture} = req?.files;

        //extract the user id from the decripted token which is stored in the req.user
        const userId = req.user.id;

        
        const cloudinaryResponse = await cloudinaryFileUpload(displayPicture , process.env.profilePictures_Folder_Name , null , 60);

        const updatedProfileResponse = await User.findByIdAndUpdate(userId , {image : cloudinaryResponse.secure_url}, {new:true});

        return res.status(StatusCodes.CREATED).json({
            message : 'your profile picture has been updated sucessfully',
            updatedProfileResponse,
            cloudinaryResponse
        })

    } catch (error) {
        console.log('error while updating the profile picture' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while updating the users profile picture',
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
            return res.status(StatusCodes.PARTIAL_CONTENT).json({
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
            await NewCourseProgress.findByIdAndDelete(eachCourseProgressId);
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
        return res.status(StatusCodes.OK).json({
            message : 'your details has been sucessfully delted from the data base'
        })
    } catch (error) {
        console.log('error while deleting a user' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while deleting a user',
            error 
        })
    }
}

const getAllUserDetails = async (req,res) => {
    try {
        const userId = req.user.id;
        const userFullDetails = await User.findById(userId).populate('additionalDetails');
        return res.status(StatusCodes.OK).json({
            message : 'data fetched sucesfully',
            userFullDetails,
        })
    } catch (error) {
        console.log('error while fetching the user details', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while trying to fetch the user details',
            error,
        })
    }
}

const getUserEnrolledCourses = async (req,res) => {
    try {
        //get the user id
        const userId = req.user.id;

        //then extract the the courses he is enrolled into and populate it
        const userDetails = await User.findById(userId)
        .populate({
            path : 'courses',
            populate : {
                path : 'courseContent',
                populate : {
                    path : 'subSection'
                }
            }
        }).exec();
        
        if(!userDetails){
            return res.status(StatusCodes.BAD_GATEWAY).json({
                message : 'no user found with the given id',
            })
        }

        const userEnrolledCourses = userDetails.courses;

        //return the response
        return res.status(StatusCodes.OK).json({
            message : "User enrolled courses Fetched",
            userEnrolledCourses
        })
    } catch (error) {
        console.log('error while fetchig the user enrolled courses ' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "Error while Fetching courses",
            description : 'error while fetching the courses the user have enrolled into',
        })
    }
}

const instructorDashboard = async (req,res) => {
    try {
        const courseDetails = await Course.find({instructor : req.user.id});

        //now generate the course data
        const courseData = courseDetails.map((course) => {
            console.log("the course is " , course);
            const totalStudents = course?.studentsEnrolled?.length;
            const totalAmountGenerated = totalStudents * parseInt(course.price);

            const courseDataStats = {
                _id : course._id,
                courseName : course.courseName,
                courseDescription : course.courseDescription,
                totalStudents,
                totalAmountGenerated,
                image : course.thumbnail
            }
            return courseDataStats;
        })

        return res.status(StatusCodes.OK).json({
            message : 'instructor stats generated',
            courseData,
        })
    } catch (error) {
        console.log("error in instructor dashboard in profile controller" , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'no instructor data fetched',
            description : 'error while fetching the instructor all courses data',
        })
    }
}

module.exports = {
    updateProfileData ,
    deleteUserPermanently,
    getAllUserDetails,
    updateProfilePhoto,
    getUserEnrolledCourses,
    instructorDashboard
}
