const {Schema,model} = require("mongoose");
const mongoose = require('mongoose')
  
const MySchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim : true
    },
    lastName: {
        type: String,
        required: true,
        trim : true
    },
    email: {
        type: String,
        required: true,
        unique : true,
        trim : true
    },
    accountType : {
        type : String,
        enum : ["Student" , "Instructor" , "Admin"],
        default : "Student",
        required : true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim : true
    },
    password: {
        type: String,
        required: true,
    },
    courses : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'courses'
    }],  
    image : {
        type : String,
        required : true
    },
    additionalDetails : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'profile'
    },
    courseProgress : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'courseProgress'
    }]
});

module.exports = model("user", MySchema);
  