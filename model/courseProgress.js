const {Schema,model} = require("mongoose");
const mongoose = require('mongoose');
  
const MySchema = new Schema({
    courseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Courses'
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
    },
    completedVideos : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'SubSection'
    }],
});

mongoose.models = {};

module.exports = model.NewCourseProgress || model("NewCourseProgress", MySchema);
  