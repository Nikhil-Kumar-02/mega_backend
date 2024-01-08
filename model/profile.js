const {Schema,model} = require("mongoose");
  
const MySchema = new Schema({
    gender : {
        type :String,
        enum : ["Male" , "Female" , "Others"],
        required : true,
        trim : true
    },
    dob : {
        type :String,
        trim : true
    },
    about : {
        type : String,
        required : true,
        trim : true
    },
    contactNumber : {
        type : Number,
        required : true,
        trim : true
    },
});

module.exports = model("Profile", MySchema);
  