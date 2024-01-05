const {Schema,model} = require("mongoose");
const sendEmail = require('../utils/mailer');
  
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

//send email for otp verification
async function sendVerificationMail(email) {
    try {
        const mailresult = await sendEmail(email , otp);
        console.log("email sent sucessfully : " , mailresult);
    } catch (error) {
        console.log("error occured while sending mail" , error);
        throw error;
    }
}

MySchema.pre("save" , async function(next){
    await sendVerificationMail(this.email , this.otp);
    next();
})

module.exports = model("otp", MySchema);
  