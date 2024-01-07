const Tag = require('../model/tags');
const { StatusCodes } = require('http-status-codes');

//create tags handler function
const createTag = async (req,res) => {
    try {
        //we have done authentication and authorization already then reached here
        const {name , description} = req.body;

        if(!name || !description){
            console.log('all feilds not present');
            res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'both name and description is reauired to create a tage'
            })
        }

        //both feilds present so create a tag
        const tagDetails = await Tag.create(name , description);
        console.log(tagDetails);
        res.status(StatusCodes.OK).json({
            message : 'tag created sucessfully'
        })
    } catch (error) {
        console.log('error in controller while creating tag',error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'cannot create tag',
            error : error
        })
    }
}

//get all tags
const showAllTags = async (req,res) => {
    try {
        //we just have to fetch and return all tags
        const tags = await Tag.find({} , {name : true , description:true});
        res.status(StatusCodes.OK).json({
            message : 'sucessfully fetched all tags from db',
            data : tags
        })
    } catch (error) {
        console.log('error in fetching all tags' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'cannot fetch all tags',
            error : error
        })
    }
}


module.exports = {
    showAllTags , 
    createTag
}