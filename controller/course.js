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
        const {courseName , category , courseDescription , whatYouWillLearn , price , tag , language , status , instructions} = req.body;

        const thumbnail  = req?.files?.courseImage; 
        console.log('image is : ', thumbnail);
        //check validity of each of the input
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !category){
            return res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'all feilds are required'
            })
        }
        //check for instructor why again as we any way will add this course to the user
        //so we will need the instructor anyways

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);

        if(!instructorDetails){
            console.log('instructor not found ');
            return res.status(StatusCodes.NOT_FOUND).json({
                message : 'unable to find a instructor with this id'
            })
        }

        //check if the tags recieved are valid or not
        const allTagsId = [];
        const jsonified_tag = JSON.parse(tag);
        console.log('the jsonified tags : ' , jsonified_tag);
        for (const eachtag of jsonified_tag) {
            console.log("each tag extracted : " , eachtag.name);
            let foundTag = await Tag.findOne({ name : eachtag.name });
        
            if (!foundTag) {
                // console.log(`Tag '${eachtag}' not found in the database`);
                // return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                //     message: 'Entered tag is not a valid tag',
                //     invalidTag: eachtag
                // });
                foundTag = await Tag.create({name:eachtag.name , description:eachtag.name})
            }
            // else{
            //     allTagsId.push(foundTag._id);
            // }
            allTagsId.push(foundTag._id);
        }
        console.log('all tags found ids' , allTagsId);
        //find the category id from the recieved category name
        const categoryId = await Category.findOne({name : category});

        if(!categoryId){
            console.log("no such input category found");
            return res.status(StatusCodes.NOT_FOUND).json({
                message : "there doesnot exists any such category"
            })
        }

        //upload image to cloudinary
        console.log('the thumbnail recieved is  : ' , thumbnail);
        const cloudinaryThumbnailImageResponse = await cloudinaryFileUpload(thumbnail , process.env.thubmnails_Folder_Name, null ,'50')
        
        //create an entry of new course
        const newCourse = await Course.create({
            courseName , 
            courseDescription , 
            instructor : instructorDetails._id,
            whatYouWillLearn , 
            price, 
            language ,
            thumbnail : cloudinaryThumbnailImageResponse.secure_url,
            tag : allTagsId,
            category : categoryId,
            instructions,
            status
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
                await Tag.findByIdAndUpdate(eachtagId,
                    {
                        $push : {
                            course : newCourse._id,
                        }
                    }
                )
            }
        } catch (error) {
            console.log('error while pushing this new course into all tags ');
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
            console.log('error while pushing this new course into category ');
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message : 'error while pushing courses into tags'
            })
        }
        
        //now return response
        return res.status(StatusCodes.OK).json({
            message : 'sucessfuly created the course and also done all immediate steps',
            data : newCourse
        })

    } catch (error) {
        console.log('error while creating course : ' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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

        return res.status(StatusCodes.OK).json({
            message : 'all courses sucessfully fetched' , 
            data : allCourses
        })
    } catch (error) {
        console.log('error while fetching all courses' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
        .populate('tag')
        .populate('category').exec();   

        if(!detailedCourseResponse){
            console.log('no course found from the input course id');
            return res.status(StatusCodes.NOT_FOUND).json({
                message : 'no course found from the input course id'
            })
        }

        //return response
        return res.status(StatusCodes.OK).json({
            message : 'course complete data fetched from db',
            detailedCourseResponse
        })
    } catch (error) {
        console.log('error while fetching the complete course details');
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'error while fetching the complete course details',
            error
        })
    }
}

// const editCourse = async () => {
//     try {
//         //fetch user details
//         const {courseName , category , courseDescription , whatYouWillLearn , price , tag , language , status , instructions , courseId} = req.body;

//         let updatePayload = {};
//         if(courseName){
//             updatePayload.courseName = courseName
//         }
//         if(category){
//             updatePayload.category = category
//         }
//         if(courseDescription){
//             updatePayload.courseDescription = courseDescription
//         }
//         if(whatYouWillLearn){
//             updatePayload.whatYouWillLearn = whatYouWillLearn
//         }
//         if(price){
//             updatePayload.price = price
//         }
//         if(status){
//             updatePayload.status = status
//         }
//         if(instructions){
//             updatePayload.instructions = instructions
//         }

//         const thumbnail  = req?.files?.courseImage; 

//         if(thumbnail){
//             //upload image to cloudinary
//             console.log('the thumbnail recieved is  : ' , thumbnail);
//             const cloudinaryThumbnailImageResponse = await cloudinaryFileUpload(thumbnail , process.env.thubmnails_Folder_Name, null ,'50');
//             updatePayload.thumbnail = cloudinaryThumbnailImageResponse.secure_url;
//         }

//         //check if the tags recieved are valid or not
//         const allTagsId = [];
//         const jsonified_tag = JSON.parse(tag);
//         console.log('the jsonified tags : ' , jsonified_tag);
//         for (const eachtag of jsonified_tag) {
//             console.log("each tag extracted : " , eachtag.name);
//             let foundTag = await Tag.findOne({ name : eachtag.name });
        
//             if (!foundTag) {
//                 // console.log(`Tag '${eachtag}' not found in the database`);
//                 // return res.status(StatusCodes.NOT_ACCEPTABLE).json({
//                 //     message: 'Entered tag is not a valid tag',
//                 //     invalidTag: eachtag
//                 // });
//                 foundTag = await Tag.create({name:eachtag.name , description:eachtag.name})
//             }
//             // else{
//             //     allTagsId.push(foundTag._id);
//             // }
//             allTagsId.push(foundTag._id);
//         }
//         console.log('all tags found ids' , allTagsId);
        
//         //find the category id from the recieved category name
//         const categoryId = await Category.findOne({name : category});

//         if(!categoryId){
//             console.log("no such input category found");
//             return res.status(StatusCodes.NOT_FOUND).json({
//                 message : "there doesnot exists any such category"
//             })
//         }

        
        
//         //create an entry of new course
//         const newCourse = await Course.create({
//             courseName , 
//             courseDescription , 
//             instructor : instructorDetails._id,
//             whatYouWillLearn , 
//             price, 
//             language ,
//             thumbnail : cloudinaryThumbnailImageResponse.secure_url,
//             tag : allTagsId,
//             category : categoryId,
//             instructions,
//             status
//         })

//         //update the tag schema
//         try {
//             for (const eachtagId of allTagsId) {
//                 await Tag.findByIdAndUpdate(eachtagId,
//                     {
//                         $push : {
//                             course : newCourse._id,
//                         }
//                     }
//                 )
//             }
//         } catch (error) {
//             console.log('error while pushing this new course into all tags ');
//             return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//                 message : 'error while pushing courses into tags'
//             })
//         }

//         //similarly update a category model
//         try {
//             await Category.findOneAndUpdate({name : category} , {
//                 $push : {
//                     courses : newCourse._id
//                 }
//             })
//         } catch (error) {
//             console.log('error while pushing this new course into category ');
//             return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//                 message : 'error while pushing courses into tags'
//             })
//         }
        
//         //now return response
//         return res.status(StatusCodes.OK).json({
//             message : 'sucessfuly created the course and also done all immediate steps',
//             data : newCourse
//         })

//     } catch (error) {
//         console.log('error while creating course : ' , error);
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//             message : 'unable to create a course',
//             error : error
//         })
//     }
// }

const  instructor_user_Courses = async (req,res) => {
    try {
        const userId = req.user.id;

        const userAllCourses = await User.findById(userId , {courses : true})
        .populate({
            path : "courses",
            populate: {
                path: 'courseContent',
                populate : {
                    path : 'subSection'
                }
            }
        }).exec();
        console.log("user courses are : " , userAllCourses);

        return res.status(StatusCodes.OK).json({
            message : "fetched user all Courses",
            userAllCourses,
        })
    } catch (error) {
        console.log("error while fetching the instructor courses " , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "Cannot Fetch courses",
            description : "error while fetching the instructor courses"
        })
    }
}

module.exports = {
    createCourse ,
    showAllCourses,
    getCompleteCourseDetails,
    // editCourse,
    instructor_user_Courses,
}