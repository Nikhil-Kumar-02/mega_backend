const {Schema,model, default: mongoose} = require("mongoose");
  
const MySchema = new Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    description : {
        type : String,
        trim : true
    },
    cetegoryCreator : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    courses : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Courses'
        }
    ],
});

module.exports = model("Category", MySchema);
  