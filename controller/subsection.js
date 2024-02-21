const Subsection = require('../model/subSection');
const Section = require('../model/section');
const { StatusCodes } = require('http-status-codes');
const cloudinaryFileUpload = require('../utils/imageUploader');
require('dotenv').config();
const {deleteFromCloudinary} = require('../utils/deleteUploadedData');

const createSubSection = async (req,res) => {
    try {
        //fetch data
        console.log("the data recieved in the create sub section is : " , req.body);

        const {title , description , sectionId} = req.body;
        
        const video = req.files.videoFile;
        console.log('the video file is : ' , video);

        //validate data
        if(!title || !description || !sectionId){
            console.log('data missing');
            return res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'all feilds are mandatory'
            })
        }
        //upload video to cloudinary
        const cloudinaryResponse = await cloudinaryFileUpload(video , process.env.courseVideo_Folder_Name);
        // const timeDuration = `${hours}h : ${minutes}m : ${seconds}s`;

        console.log("the clodinary response is : " , cloudinaryResponse);
        console.log("the clodinary response duration is : " , cloudinaryResponse?.duration);
        let timeDuration = cloudinaryResponse?.duration;
        if(!timeDuration){
            timeDuration = 56;
        }

        //create a subsection
        const newlyCreatedSubsection = await Subsection.create({
            title , 
            timeDuration,
            description,
            videoUrl : cloudinaryResponse.secure_url
        })
        //insert this subsection into the section id recieved
        const updatedSectionDetails = await Section.findByIdAndUpdate(sectionId , {
            $push : {
                subSection : newlyCreatedSubsection._id
            }
        },{new : true}).populate('subSection');

        //return response
        return res.status(StatusCodes.OK).json({
            message : 'subsection sucessfully created',
            updatedSectionDetails
        })
    } catch (error) {
        console.log('error while  creating subsection ' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'Cannot Create Subsection',
            error : error
        })
    }
}

const deleteSubsection = async (req,res) => {
    try {
        //fetch data 
        const {subSectionId , sectionId} = req.body;
        //validate data
        if(!sectionId || !subSectionId){
            console.log('missing data while deleting a sebsection');
            return res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'sectionId or subsectionId missing'
            })
        }
        //delete subsection and deleted its instance from the section as well
        const deletedSubsection = await Subsection.findByIdAndDelete(subSectionId);

        const updatedSectionDetails = await Section.findOneAndUpdate({_id : sectionId} , {
            $pull : {
                subSection : subSectionId
            }
        },{new : true})//.populate('subSection');

        //also remove its presence from the cloudinary
        const cloudinaryResponse = await deleteFromCloudinary("video" , deletedSubsection.videoUrl);
        
        //return response
        return res.status(StatusCodes.OK).json({
            message : 'subsection deleted sucessfully',
            updatedSectionDetails,
            cloudinaryResponse
        })
    } catch (error) {
        console.log('error while deleting a subsection' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while deleting a subsection',
            error
        })
    }
}

const updateSubSection = async (req,res) => {
    try {
        //fetch data
        console.log("data recieved for subsection updation : " , req.body)
        const {title="" ,  description="" , subsectionId=""} = req.body;
        //validate data
        if(!title && !description && !subsectionId){
            console.log('data missing');
            return res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'all feilds are mandatory'
            })
        }

        let timeDuration = 0;
        let updatePayload = {};
        
        if(title){
            updatePayload.title = title;
        }
        if(description){
            updatePayload.description = description;
        }
        if(req?.files?.videoFile){
            const cloudinaryResponse = await cloudinaryFileUpload(req.files.videoFile , process.env.courseVideo_Folder_Name);
            updatePayload.videoUrl = cloudinaryResponse.secure_url;
            updatePayload.timeDuration = cloudinaryResponse?.duration;
        }
        //update the data
        console.log('the data recived for the updation ',updatePayload);

        const updatedSubSection = await Subsection.findByIdAndUpdate(subsectionId , updatePayload, {new : true});
        //return response 
        return res.status(StatusCodes.CREATED).json({
            message : 'the subsection has been updated sucssfully',
            updatedSubSection
        })
    } catch (error) {
        console.log('error while updating a subsection' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while updating a subsection',
            error
        })
    }
}

module.exports = {
    createSubSection ,
    deleteSubsection,
    updateSubSection
}