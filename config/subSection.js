const {Schema,model} = require("mongoose");
  
const MySchema = new Schema({
    title : {
        type : Number,
        required : true,
        trim : true
    },
    timeDuration : {
        type : String,
        required : true,
        trim : true
    },
    description : {
        type : Number,
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
        required : true,
        trim : true
    },
});

module.exports = model("subSection", MySchema);
  