const {Schema,model} = require("mongoose");
const mongoose = require('mongoose');
  
const MySchema = new Schema({
    sectionName : {
        type : String,
        trim : true
    },
    subSection : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'subSection'
    }],
});

module.exports = model("section", MySchema);
   