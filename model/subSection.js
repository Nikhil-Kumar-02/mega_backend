const {Schema,model} = require("mongoose");
  
const MySchema = new Schema({
    title : {
        type : String,
        required : true,
        trim : true
    },
    timeDuration : {
        type : String,
        required : true,
        trim : true
    },
    description : {
        type : String,
        required : true,
        trim : true
    },
    videoUrl : {
        type : String,
        required : true,
        trim : true
    },
    additionalUrl : {
        type : Number,
        trim : true
    },
});

module.exports = model("subSection", MySchema);
  