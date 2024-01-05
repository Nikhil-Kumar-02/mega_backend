const {Schema,model} = require("mongoose");
const mongoose = require('mongoose');
  
const MySchema = new Schema({
    sectionName : {
        type : String,
        required : true,
        trim : true
    },
    subSection : [{
        ttype : mongoose.Schema.Types.ObjectId,
        ref : 'subSection'
    }],
});

module.exports = model("section", MySchema);
  