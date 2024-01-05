const {Schema,model} = require("mongoose");
const mongoose = require('mongoose');
  
const MySchema = new Schema({
    user : {
        ttype : mongoose.Schema.Types.ObjectId,
        ref : 'user'
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

module.exports = model("ratingAndReviews", MySchema);
  