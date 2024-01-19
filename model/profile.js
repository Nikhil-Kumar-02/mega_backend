const {Schema,model} = require("mongoose");
  
const MySchema = new Schema({
    gender : {
        type :String,
        enum : ["Male" , "Female" , "Others"],
        trim : true
    },
    dob : {
        type :String,
        trim : true
    },
    image : {
        type : String,
    },
    about : {
        type : String,
        trim : true
    },
    contactNumber : {
        type : Number,
        trim : true
    },
});

module.exports = model("Profile", MySchema);
  