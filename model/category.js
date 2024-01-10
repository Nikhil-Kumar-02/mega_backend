const {Schema,model} = require("mongoose");
  
const MySchema = new Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    description : {
        type : String,
        required : true,
        trim : true
    },
});

module.exports = model("Category", MySchema);
  