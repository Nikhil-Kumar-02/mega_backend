const {Schema,model} = require("mongoose");
const mongoose = require('mongoose');
  
const MySchema = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    rating : {
        type : Number,
        required : true,
        trim : true
    },
    review : {
        type : String,
        required : true,
        trim : true
    },
});

module.exports = model("RatingAndReviews", MySchema);
  