const {Schema,model} = require("mongoose");
  
const MySchema = new Schema({
    email : {
        type : String,
        required : true
    },
    otp : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now(),
        expires : 5*60,
    },
    
});

module.exports = model("otp", MySchema);
  