const { StatusCodes } = require('http-status-codes');
const Category = require('../model/category');
const Courses = require('../model/courses');

const createCategory = async (req,res) => {
    try {
        const {name , description} = req.body;
        if(!name){
            res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'all feilds are mandatory',
            })
        }
        const createdCategory = await Category.create(name , description);

        res.status(StatusCodes.OK).json({
            message : 'a category has been created sucessfully',
            data : createCategory
        })
    } catch (error) {
        console.log('error while creating a category' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while creating a category',
            error
        })
    }
}

const showAllCategories = async (req,res) => {
    try {
        const allCategories = await Category.find({} , {name:true , description : true});
        res.status(StatusCodes.OK).json({
            message : 'all data fetched',
            data : allCategories
        })
    } catch (error) {
        console.log('error while viewing all categories' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while veiwing all categories',
            error
        });
    }
}

const categoryPageDetails = async (req,res) => {
    try {
        const {categoryId} = req.body;
        const getCategoryCourses = await Category.findById(categoryId).populate('courses').exec();

        if(!getCategoryCourses){
            res.status(StatusCodes.NO_CONTENT).json({
                message : 'no coures available in this category'
            })
        }

        const otherCourses = await Category.find({_id : {$ne : categoryId}}).populate('courses').exec();

        //find the top selling courses
        const allTopSellingCourses = await Courses.aggregate([
            {
                $group: {
                    _id: '$category', // Group by the 'category' field
                    totalStudents: { $sum: { $size: '$studentsEnrolled' } } 
                    // Count the total number of students in each category
                }
            }
        ]).limit(10).exec();
        //try to sort according to the number of student in each category

        /*
        //another way to filter the result 
        const allTopSellingCourses = await Courses.aggregate([
            {
                $unwind: '$studentsEnrolled' // Unwind the studentsEnrolled array
            },
            {
                $group: {
                _id: {
                    category: '$category',
                    student: '$studentsEnrolled'
                }
                }
            },
            {
                $group: {
                _id: '$_id.category', // Group by category
                totalStudents: { $sum: 1 } // Count the total number of unique students in each category
                }
            }
        ]);
        */

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'veiwing category page detials',
            getCategoryCourses , 
            otherCourses,
            allTopSellingCourses
        });
    } catch (error) {
        console.log('error while viewing category page detials' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while veiwing category page detials',
            error
        });
    }
}

module.exports = {
    createCategory ,
    showAllCategories ,
    categoryPageDetails   
}