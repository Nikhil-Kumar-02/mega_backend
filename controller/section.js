const Section = require('../model/section');
const Course = require('../model/courses');
const { StatusCodes } = require('http-status-codes');

const createSection = async (req,res) => {
    try {
        //in input we will only recieve the name of the section and the id of the section
        //to which this course belongs to
        //all authentication and authorisation will be done at middleware level

        const {courseId , sectionName} = req.body;
        if(!courseId || !sectionName){
            console.log('data missing while creating section');
            res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'section name or course id is missing'
            })
        }
        //we will find the course and add this section id to that course
        // const findCourse = await Course.findById(courseId);
        // if(!findCourse){
        //     console.log('unable to find the course from the recieved course id');
        //     res.status(StatusCodes.NOT_FOUND).json({
        //         message : 'unable to find the course from the recieved course id',
        //         description : 'send the correct courseid for which you want to create a section'
        //     })
        // }

        //create a new section
        const newSection = await Section.create({sectionName});

        //now add this section to that course
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId , {
            $push : {
                courseContent : newSection._id
            }
        },{new : true}).populate({
            path: 'section',
            populate: {
                path: 'subSection',
                model: 'subSection'
            }
        });

        console.log("the whole course is : " , updatedCourseDetails);

        res.status(StatusCodes.OK).json({
            message : 'sucssfully created a section',
            updatedCourseDetails
        })

    } catch (error) {
        console.log('error while create a section' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message  : 'error while creating a section for a course',
            error : error
        })
    }
}

const deleteSection = async (req,res) => {
    try {
        //fetch the course id and section id we want to delete that section from this course
        const {courseId} = req.body;
        const {sectionId} = req.params
        //validate the fetched data
        if(!sectionId){
            res.status(StatusCodes.NO_CONTENT).json({
                message : 'section id is missing in request'
            })
        }
        // const findCourse = await Course.findById(courseId);
        // if(!findCourse){
        //     console.log('error while finding the course with this id');
        //     res.status(StatusCodes.BAD_REQUEST).json({
        //         message  : 'error while finding the course with this id',
        //         description : 'please enter the correct course id'
        //     })
        // }
        //if this course exist then check if this section id is present in this course
        // if(!findCourse.courseContent.includes(sectionId)){
        //     console.log('error while finding the section with this id');
        //     res.status(StatusCodes.BAD_REQUEST).json({
        //         message  : 'error while finding the section with this id',
        //         description : 'please enter the correct section id'
        //     })
        // }
        //perform the operation
        await Section.findByIdAndDelete(sectionId);
        const updatedCourseDetails = await Course.findOneAndUpdate(
            { _id: courseId },
            { 
                $pull: {
                    courseContent: sectionId 
                } 
            },
            {new : true}
        ).populate('section');
        res.status(StatusCodes.OK).json({
            message : 'a section has been sucessfully removed from the course',
            data : updatedCourseDetails
        })
    } catch (error) {
        console.log('error while deleting a section' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message  : 'error while deleting a section for a course',
            error : error
        })
    }
}

const updateSection = async (req,res) => {
    try {
        const {sectionName , sectionId} = req.body;
        if(!sectionName || !sectionId){
            res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'all feilds are mandatory'
            })
        }
        const updatedSection = await Section.findByIdAndUpdate(sectionId , {sectionName} , {new : true});

        res.status(StatusCodes.OK).json({
            message : 'the section name has been updated sucessfully',
            data : updatedSection
        })
    } catch (error) {
        console.log('error while updating a section' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message  : 'error while udating a section',
            error : error
        })
    }
}

module.exports = {
    createSection , 
    deleteSection , 
    updateSection
}