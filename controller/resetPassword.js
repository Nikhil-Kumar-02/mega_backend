//this is when you forgot the password and now you want to add new password but you dont know the last pass
const { StatusCodes } = require('http-status-codes');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/mailer');

//reset password token that is this will be responsible to sending the reset webpage link
const resetPasswordToken = async (req,res) => {
    try {
        //get email from the req
        const email = req.body.email;
        //validate the email if present or not
        if(!email){
            res.status(StatusCodes.NO_CONTENT).json({
                message : "email not present"
            })
        }

        const findUser = await User.findOne(email);
        if(!findUser){
            res.status(StatusCodes.NOT_FOUND).json({
                message : 'your email id is not registered with us',
            })
        }

        //generate token
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(email , 
                                                    {
                                                        token : token,
                                                        resetPasswordExpires : Date.now() + 5*50*1000
                                                    } , {new : true});
        
        //create url
        const url = `http://localhost:3000/update-password/${token}`;

        //send email containing this url
        const mailresult = await sendEmail(email , `Reset Password Link :  ${url}`);

        //return response
        res.status(StatusCodes.OK).json({
            message : 'sucessfully mailed you the link for resetting the password',
            desdription : 'click the link to redirect to website for password updation'
        })
    } catch (error) {
        console.log('error in controller -> resetPasswordToken ')
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'sucessfully mailed you the link for resetting the password',
            desdription : 'click the link to redirect to website for password updation'
        })
    }

}



//reset password into db