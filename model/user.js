const {Schema,model} = require("mongoose");
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
  
const MySchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim : true
    },
    lastName: {
        type: String,
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
    },
    additionalDetails : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'profile'
    },
    courseProgress : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'courseProgress'
    }],
    token : {
        type : String,
    },
    resetPasswordExpires : {
        type : Date,
    }
});

MySchema.pre('save', async function (next) {
    try {
        const hashedPassword = await bcrypt.hash(this.password, 6);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = model("user", MySchema);
  