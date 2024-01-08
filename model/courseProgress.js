const {Schema,model} = require("mongoose");
const mongoose = require('mongoose');
  
const MySchema = new Schema({
    courseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Courses'
    },
    completedVideos : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'SubSection'
    }],
});

module.exports = model("CourseProgress", MySchema);
  