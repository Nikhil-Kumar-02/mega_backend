const {Schema,model} = require("mongoose");
const mongoose = require('mongoose')
  
const MySchema = new Schema({
    users : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }],
    courseName : {
        type :String,
        required : true,
        trim : true
    },
    price : {
        type : String,
        required : true,
        trim : true
    },
    address : {
        type : String,
        required : true,
        trim : true
    },
    pinCode : {
        type : String,
        required : true,
        trim : true
    },
    courseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Courses'
    }
});

module.exports = model("Invoices", MySchema);
  