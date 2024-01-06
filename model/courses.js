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
        ref : 'user'
    },
    whatYouWillLearn : {
        type : String,
        trim : true
    },
    courseContent : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'section'
    }],
    reviewAndRatings : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'ratingAndReviews'
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
    tag : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'tags'
    }],
    studentsEnrolled : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    }]
});

module.exports = model("courses", MySchema);
  