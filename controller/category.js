const { StatusCodes } = require('http-status-codes');
const Category = require('../model/category');
const Courses = require('../model/courses');

const createCategory = async (req,res) => {
    try {
        const {name , description} = req.body;
        const userId = req.user.id;
        if(!name){
            return res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'all feilds are mandatory',
            })
        }
        const createdCategory = await Category.create({
                                    name , description , cetegoryCreator : userId});

        return res.status(StatusCodes.OK).json({
            message : 'a category has been created sucessfully',
            data : createdCategory
        })
    } catch (error) {
        console.log('error while creating a category' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while creating a category',
            error
        })
    }
}

const showAllCategories = async (req,res) => {
    try {
        const allCategories = await Category.find({} , {name:true , description : true});
        return res.status(StatusCodes.OK).json({
            message : 'all data fetched',
            allCategories
        })
    } catch (error) {
        console.log('error while viewing all categories' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while veiwing all categories',
            error
        });
    }
}

const categoryPageDetails = async (req,res) => {
    try {
        const {categoryId} = req.params;
        console.log(categoryId);
        const getCategoryCourses = await Category.findById(categoryId).populate('courses').exec();
        console.log("the found category is : " , getCategoryCourses);

        if(!getCategoryCourses){
            res.status(StatusCodes.NO_CONTENT).json({
                message : 'no coures available in this category'
            })
        }

        const otherCategoryCourses = await Category.find({_id : {$ne : categoryId}}).populate('courses').exec();
        let otherCourses = [];
        for(const each_category_course of otherCategoryCourses){
            for(const each_course of each_category_course.courses){
                otherCourses.push(each_course);
            }
        }
        console.log("the other category courses are : " , otherCourses);

        //find the top selling courses
        const allTopSellingCourses = await Courses.aggregate([
            {
                $group: {
                    _id: '$category', // Group by the 'category' field
                    totalStudents: { $sum: { $size: '$studentsEnrolled' } },
                    // Count the total number of students in each category
                }
            } , 
            {
                $sort : {totalStudents : -1}
            } , 
            {
                $lookup : {
                    from : "tag",
                    localField : "_id",
                    foreignField : "tag",
                    as : "tag"
                }
            }
        ]).limit(10).exec();

        console.log("the filtered top selling courses are : " , allTopSellingCourses);
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

        return res.status(StatusCodes.OK).json({
            message : 'veiwing category page detials',
            getCategoryCourses , 
            otherCourses,
            allTopSellingCourses
        });
    } catch (error) {
        console.log('error while viewing category page detials' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'Error while veiwing category page detials',
            error
        });
    }
}

module.exports = {
    createCategory ,
    showAllCategories ,
    categoryPageDetails   
}