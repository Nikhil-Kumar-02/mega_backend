const {Schema,model} = require("mongoose");
const mongoose = require('mongoose');
  
const MySchema = new Schema({
    course : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'courses'
    }],
    name : {
        type : Number,
        required : true,
        trim : true
    },
    Description : {
        type : String,
        required : true,
        trim : true
    },
});

module.exports = model("tags", MySchema);
  