const Course = require('../model/courses');
const User = require('../model/user');
const Category = require('../model/category')
const Tag = require('../model/tags');
const cloudinaryFileUpload = require('../utils/imageUploader');
const { StatusCodes } = require('http-status-codes');

//create a course
const createCourse = async (req,res) => {
    try {
        //fetch user details
        //no need to check if user is authorised to do so as already checked authorisation in middleware
        //fetch all the input data like  title , description , price ,  category , tags , thumbnail
        const {courseName , category , courseDescription , whatYouWillLearn , price , tag , language} = req.body;

        const thumbnail  = req.body.thumbnailImage; 
        //check validity of each of the input
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !category){
            res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'all feilds are required'
            })
        }
        //check for instructor why again as we any way will add this course to the user
        //so we will need the instructor anyways

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);

        if(!instructorDetails){
            console.log('instructor not found ');
            res.status(StatusCodes.NOT_FOUND).json({
                message : 'unable to find a instructor with this id'
            })
        }

        //check if the tags recieved are valid or not
        const allTagsId = [];
        for (const eachtag of tag) {
            const findTag = await Tag.findOne({ name : eachtag });
        
            if (!findTag) {
                console.log(`Tag '${eachtag}' not found in the database`);
                return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                    message: 'Entered tag is not a valid tag',
                    invalidTag: eachtag
                });
            }
            else{
                allTagsId.push(findTag._id);
            }
        }

        //upload image to cloudinary
        const thumbnailImage = await cloudinaryFileUpload(thumbnail , process.env.thubmnails_Folder_Name, null ,'50')
        
        //create an entry of new course
        const newCourse = await Course.create({
            courseName , 
            courseDescription , 
            instructor : instructorDetails._id,
            whatYouWillLearn , 
            price, 
            language ,
            thumbnail : thumbnailImage.secure_url,
            tag : allTagsId,
            category
        })

        //now add this course to the instructors course list
        const updateInstructor = await User.findByIdAndUpdate(
            {_id : instructorDetails._id} , 
            {
                $push : {
                    courses : newCourse._id,
                }
            },
            {
                new : true,
            }
        )

        //update the tag schema
        try {
            for (const eachtagId of allTagsId) {
                await Tag.findByIdAndUpdate({eachtagId},
                    {
                        $push : {
                            course : newCourse._id,
                        }
                    }
                )
            }
        } catch (error) {
            console.log('error while pushing this new course into tag ');
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message : 'error while pushing courses into tags'
            })
        }

        //similarly update a category model
        try {
            await Category.findOneAndUpdate({name : category} , {
                $push : {
                    courses : newCourse._id
                }
            })
        } catch (error) {
            console.log('error while pushing this new course into tag ');
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message : 'error while pushing courses into tags'
            })
        }
        
        //now return response
        res.status(StatusCodes.OK).json({
            message : 'sucessfuly created the course and also done all immediate steps',
            data : newCourse
        })

    } catch (error) {
        console.log('error while creating course : ' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'unable to create a course',
            error : error
        })
    }
}

//get all courses
const showAllCourses = async (req,res) => {
    try {
        const allCourses = await Course.find({} , {courseName:true,
                                            price : true,
                                            thumbnail : true,
                                            instructor :true,
                                            reviewAndRatings : true,
                                            studentsEnrolled : true,
                                            category : true}).populate("instructor").exec();

        res.status(StatusCodes.OK).json({
            message : 'all courses sucessfully fetched' , 
            data : allCourses
        })
    } catch (error) {
        console.log('error while fetching all courses' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while fetching all courses',
            error : error
        })
    }
}

const getCompleteCourseDetails = async (req,res) => {
    try {
        //fetch the data
        const {courseId} = req.body;
        //validate data
        //generate the desired result
        const detailedCourseResponse = await Course.findById(courseId)
        .populate({
            path : 'instructor',
            populate : {
                path : 'additionalDetails',
                model : 'Profile'
            }
        })
        .populate({
            path: 'courseContent',
            populate: {
                path: 'subSection',
                model: 'SubSection'
            }
        })
        .populate('reviewAndRatings')
        .populate('category').exec();   

        if(!detailedCourseResponse){
            console.log('no course found from the input course id');
            res.status(StatusCodes.NOT_FOUND).json({
                message : 'no course found from the input course id'
            })
        }

        //return response
        res.status(StatusCodes.OK).json({
            message : 'course complete data fetched from db',
            data : detailedCourseResponse
        })
    } catch (error) {
        console.log('error while fetching the complete course details');
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'error while fetching the complete course details',
            error
        })
    }
}

exports.default = {
    createCourse ,
    showAllCourses,
    getCompleteCourseDetails
}