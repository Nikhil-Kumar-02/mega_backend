const {Schema,model} = require("mongoose");
const mongoose = require('mongoose');
  
const MySchema = new Schema({
    courseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'courses'
    },
    completedVideos : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'subSection'
    }],
});

module.exports = model("courseProgress", MySchema);
  