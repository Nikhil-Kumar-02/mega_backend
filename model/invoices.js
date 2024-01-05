const {Schema,model} = require("mongoose");
const mongoose = require('mongoose')
  
const MySchema = new Schema({
    users : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
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
        ref : 'courses'
    }
});

module.exports = model("invoices", MySchema);
  