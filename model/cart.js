const {Schema,model} = require("mongoose");
const mongoose = require('mongoose');
  
const MySchema = new Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
    },
    cartItems : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Courses'
    }],
});

module.exports = model("Cart", MySchema);
  