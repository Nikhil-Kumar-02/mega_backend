const {Schema,model} = require("mongoose");
const mongoose = require('mongoose');
  
const MySchema = new Schema({
    course : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Courses'
    }],
    name : {
        type : String,
        required : true,
        trim : true
    },
    description : {
        type : String,
        required : true,
        trim : true
    },
});

module.exports = model("Tags", MySchema);
  