//this is when you forgot the password and now you want to add new password but you dont know the last pass
const { StatusCodes } = require('http-status-codes');
const User = require('../model/user');
const sendEmail = require('../utils/mailer');
const crypto = require('crypto');

//reset password token that is this will be responsible to sending the reset webpage link
const resetPasswordToken = async (req,res) => {
    try {
        //get email from the req
        const email = req.body.email;
        console.log(email);
        //validate the email if present or not
        if(!email){
            return res.status(StatusCodes.PARTIAL_CONTENT).json({
                sucess : false,
                message : "email not present"
            })
        }

        const findUser = await User.findOne({email});
        console.log('user found : ' , findUser);

        if(!findUser){
            return res.status(StatusCodes.NOT_FOUND).json({
                sucess : false,
                message : 'Your email id is not registered with us',
            }) 
        }

        //generate token
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email} , 
                                                    {
                                                        token : token,
                                                        resetPasswordExpires : Date.now() + 60*60*1000
                                                    } , {new : true});
        
        //create url
        const url = `http://localhost:3000/update-password/${token}`;

        //send email containing this url
        const mailresult = await sendEmail(email , `Reset Password Link :  ${url}`);
    
        //return response
        return res.status(StatusCodes.OK).json({
            sucess : true,
            message : 'sucessfully mailed you the link for resetting the password',
            description : 'click the link to redirect to website for password updation',
            url,
            mailresult,
            updatedDetails
        })
    } catch (error) {
        console.log('error in controller -> resetPasswordToken ')
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            sucess : false,
            message : 'unable to mail you the link for resetting the password',
        })
    }

}

//reset password into db
const resetPassword = async (req,res) => {
    //extract the token from the url user visited
    //this will hitted cuz route will be /api/vi/resetPassword/:token
    //so we can easily extract the token using the params
    try {
        //extract the email newpassword , confirmNewPassword
        const {password , confirmPassword , token } = req.body;

        console.log(req.body);
        //token is in the body cuz frontend put it there that how babbar used it
        //validation on inputs recieved
        if(password != confirmPassword){
            console.log('password not equal');
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message : "password not equal",
                description : "both password and confirm password should be same"
            })
        }
        //get user details from token as now token is also a part of user schema
        const userDetails = await User.findOne({token});

        //find user and check if the user has this token within the expiry
        if(!userDetails){
            console.log('token not found');
            return res.status(StatusCodes.BAD_REQUEST).json({
                message : "Token not found"
            }) 
        }

        if(userDetails.resetPasswordExpires < Date.now()){
            //means the token has expired that why we are ahead of time
            console.log('current time exceeds the token valid time');
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message : 'Token expired , Generate email again',
                description : "the password reset should be done within 5 mins of link generation"
            })
        }

        //if everything goes right update the password
        // const updatedDetails = await User.findOneAndUpdate({token} , {password} , {new :true});
        // console.log('updated user details is : ' , updatedDetails);
        //above wont work as this will by pass the pre hook we can use the save one or below  one
        // const updatedDetails = await User.findByIdAndUpdate(userDetails._id , {password} , {new :true});

        //or
        console.log("reached here" , userDetails)
        userDetails.password = password;
        await userDetails.save();
        // console.log('updated user details is : ' ,d  updatedDetails);
        return res.status(StatusCodes.OK).json({
            message : 'Your password has been sucessfully updated',
        })

    } catch (error) {
        console.log('error in controller -> resetpassword.js -> resetpassword');
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "error while trying to reset the password"
        })
    }
    //i can see one problem here we are changing the user details on the basis of url 
    //so if url is sniffed then someone else can hit the url before token expiration and change
    //his password before him as we are only finding the user from token and if found then updating the pass
}

module.exports = {
    resetPasswordToken , 
    resetPassword
}