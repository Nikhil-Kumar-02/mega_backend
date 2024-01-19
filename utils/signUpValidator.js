const {ReasonPhrases,StatusCodes,getReasonPhrase,getStatusCode} = require('http-status-codes');
const User = require('../model/user');

const validateSignUpData = async (req,res,next) => {
    const {firstName , lastName , email , phoneNumber , password , confirmPassword} = req.body;

    //validate data
    if(!email || !password || !firstName || !lastName || !phoneNumber ||  !confirmPassword){
        res.status(StatusCodes.PARTIAL_CONTENT).json({
            message : "All feilds are mandatory",
            description : "All feilds are mandatory"
        })
    }

    //check if the email is a valid one
    let regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    let isValid = regex.test(email);
    
    if(!isValid){
        res.status(StatusCodes.EXPECTATION_FAILED).json({
            message : "invalid email",
            description : "enter valid email only"
        })
    }

    //check user mail already exists or not
    const checkUserMail = await User.findOne({email});
    if(checkUserMail){
        res.status(StatusCodes.FORBIDDEN).json({
            message : "user already exists",
            description : "dont use the already used email"
        })
    }

    //check if password matches
    if(password != confirmPassword){
        res.status(StatusCodes.EXPECTATION_FAILED).json({
            message : "password and confirm password does not match",
            description : "both password and confirm password does not match"
        })
    }

    next();
}

module.exports = validateSignUpData;