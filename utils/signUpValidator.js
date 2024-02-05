const {ReasonPhrases,StatusCodes,getReasonPhrase,getStatusCode} = require('http-status-codes');
const User = require('../model/user');

const validateSignUpData = async (req,res,next) => {
    const {firstName , lastName , email , phoneNumber , password , confirmPassword} = req.body;

    //validate data
    if(!email || !password || !firstName || !lastName || !phoneNumber ||  !confirmPassword){
        console.log('the recieved data is : ' , req.body)
        return res.status(StatusCodes.NOT_ACCEPTABLE).json({
            message : "All feilds are mandatory",
            description : "All feilds are mandatory"
        })
    }

    //check if the email is a valid one
    let regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    let isValid = regex.test(email);
    
    if(!isValid){
        return res.status(StatusCodes.EXPECTATION_FAILED).json({
            message : "invalid email",
            description : "enter valid email only"
        })
    }

    //check user mail already exists or not
    const checkUserMail = await User.findOne({email});
    if(checkUserMail){
        return res.status(StatusCodes.FORBIDDEN).json({
            message : "User already exists",
            description : "dont use the already used email"
        })
    }

    //check if password matches
    if(password != confirmPassword){
        return res.status(StatusCodes.EXPECTATION_FAILED).json({
            message : "Password and Confirm password does not match",
            description : "both password and confirm password does not match"
        })
    }

    next();
}

module.exports = validateSignUpData;