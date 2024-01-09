const {Schema,model} = require("mongoose");
const mongoose = require('mongoose')
  
const MySchema = new Schema({
    courseName : {
        type :String,
        required : true,
        trim : true
    },
    courseDescription : {
        type :String,
        trim : true
    },
    instructor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    whatYouWillLearn : {
        type : String,
        trim : true
    },
    courseContent : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Section'
    }],
    reviewAndRatings : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'RatingAndReviews'
    }],
    price : {
        type : Number,
        required : true,
        trim : true 
    },
    thumbnail : {
        type : String,
        required : true, 
        trim : true
    },
    language : {
        type :String,
        trim : true
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref : 'Category'
    },
    instructions : {
        type : String
    },
    status : {
        type :String,
        enum : ["Draft" , "Published"]
    },
    tag : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Tags'
    }],
    studentsEnrolled : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }]
});

module.exports = model("Courses", MySchema);
  