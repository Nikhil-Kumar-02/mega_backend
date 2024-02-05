const otpGenerator = require('otp-generator');
const OTP_Model = require('../model/otp');
const User = require('../model/user');
const {StatusCodes} = require('http-status-codes');
const Profile= require('../model/profile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/mailer');
require('dotenv').config();

//send otp as to create account we have to verify the mail
const generateOpt = async (req,res) => {
    try {
        //first generate opt from the package
        const {email} = req.body;

        //check if someone has already registered with this email or not
        const findUser = await User.findOne({email : email});

        if(findUser){
            console.log('the user is : ' , findUser)
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message : "User Already Exists with this email",
                discription : "sign up with a brand new email"
            })
        }

        let generatedOTP = otpGenerator.generate(6, { 
            lowerCaseAlphabets : false , upperCaseAlphabets: false, specialChars: false 
        });

        //now i have to make sure that the generated otp is unique and this otp is 
        //is not in db hence will eb unique
        let otpPresentInDb = await OTP_Model.findOne({otp : generatedOTP});

        while(otpPresentInDb){
            generatedOTP = otpGenerator.generate(6, { 
                lowerCaseAlphabets : false , upperCaseAlphabets: false, specialChars: false 
            });
            otpPresentInDb = await OTP_Model.findOne({otp : generatedOTP});
        }

        //here means this otp is not present in the db

        //now we have send this otp to the user for verification of email
        // const mailResponse = await sendEmail(email , `${generatedOTP} is your otp for the verification of your gmail account`)
        //no need to send otp as we have configured the pre save hook for this see in model
        //also we have to save this opt for verification
        //both logic in the otp model to send it to that model as prehook exists there
        const otpmodelResponse = await OTP_Model.create({email , otp : generatedOTP});
        //now to that email this otp has been sent and then on sucessful transmission an instance will
        //be generated into the db with the email and opt which will be deleted after 5 mins

        res.status(StatusCodes.OK).json({
            message : "otp Sent sucessfully",
            otpmodelResponse
        })
    } catch (error) {
        console.log('error while trying to send otp',error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "unable to generate otp",
            description : "try again in order to generate otp"
        })
    }
}


function randomHexGenerator(){
    const hexCodes = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
    let generatedHex = "";
    while(generatedHex.length != 6){
        const idx = Math.floor(Math.random()*16);
        generatedHex = generatedHex + hexCodes[idx];
    }
    return generatedHex;
}


//signup
const signup = async(req,res) => {
    try {
        console.log("request reached here in signup")
        const {firstName , lastName , email , accountType , phoneNumber , password , otp} = req.body;
        console.log('the otp recieved is ',otp)

        //we have done all validations before so all data is present and email is valid and new

        //check is otp present or not
        if(!otp){
            return res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'OTP not present',
                description : 'please fill the otp'
            })
        }
        
        //find the alloted otp of this user
        const usersOTP = await OTP_Model.find({email}).sort({ createdAt: -1 }).limit(1).exec();
        console.log('fetched uesr is : ',usersOTP)

        if(!usersOTP || usersOTP.length == 0){
            res.status(StatusCodes.NOT_FOUND).json({
                message : "no otp is present",
                description : "either otp not generated or passed the time limit to verify or no otp sent to this email"
            })
        }

        if(usersOTP[0].otp !== otp){
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message : "OTP does not match",
                description : "you have entered the wrong otp"
            })
        }


        //all feilds are present and everything is valid so make entry for the user

        //we also need image and additional details
        //generate the image from the initails of the name

        const backgroundColor = randomHexGenerator();
        const textColor = randomHexGenerator();
        const image = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=${backgroundColor}&color=${textColor}`

        //generate a profile and fill it with nothing for now so that empty profile
        //can be referenced to the user instantly

        const profileDetails = {
            gender : null,
            dob : null,
            about : null,
            contactNumber : null,
        }
        //create an empty profile which user can fill later but we will link it with this user now
        const userProfile = await Profile.create(profileDetails);

        //now we have everything to create a user
        const newUser = await User.create({firstName , lastName , email , accountType , phoneNumber , password , image , additionalDetails : userProfile._id});

        console.log('the newly added user is : ' ,  newUser);

        return res.status(StatusCodes.CREATED).json({
            message : "Account created",
            description : "your account has been sucessfully created and verified"
        })
    } catch (error) {
        console.log('error while signing in :' , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "account not created",
            description : "your account was not created due to some unexpected error",
            error : error
        })
    }
}


//login
const userLogin = async (req,res) => {
    try {
        //get data from from req body
        const {email , password} = req.body;
        //validate data
        if(!email || !password){
            res.status(StatusCodes.PARTIAL_CONTENT).json({
                message : 'enter both email and password'
            })
        }
        //check if the user exits or not that is registered or not
        const foundUser = await User.findOne({email});
        if(!foundUser){
            res.status(StatusCodes.NOT_FOUND).json({
                message : 'User not found',
                description : 'you need to sign up first in order to log in'
            })
        }
        //match password and generate jwt token
        const passwordMatch = await bcrypt.compare(password, foundUser.password);
        if(!passwordMatch){
            res.status(StatusCodes.CONFLICT).json({
                message : 'Incorrect Password',
                description : 'please enter the correct login credentials'
            })
        }
        else{
            const payload = {
                email , 
                id : foundUser._id,
                accountType : foundUser.accountType
            }

            const token = jwt.sign(payload , process.env.JWT_SECRET , {expiresIn : '2h'});
            //create cookie and send response
            foundUser.password = undefined;

            const options = {
                expires : new Date(Date.now() + 3*24*60*60*1000),
                httpOnly : true
            }
            
            return res.cookie("token" , token , options).status(StatusCodes.ACCEPTED).json({
                token,
                foundUser,
                message : 'user logged in sucessfully'
            })
        }
    } catch (error) {
        console.log('error while trying to log in : ', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "cant log in",
            error : error
        })
    }
}


//this is when you know the current password and still want to change it to new password due to 
//security reasons

//change password
const updatePassword = async(req,res) => {
    try { 
        //get data from req body
        //get oldpasword newpassword
        const {currentPassword , newPassword} = req.body;
        const userId = req.user.id; 
        const userEmail = req.user.email;

        //valdation
        if(!currentPassword || !newPassword){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message : "Both feilds are Compulsory",
                description : "you need to enter both current password and new password",
            })
        }
        //update password in db
        const foundUser = await User.findById(userId);

        //match password and generate jwt token
        const passwordMatch = await bcrypt.compare(currentPassword, foundUser.password);

        if(!passwordMatch){
            return res.status(StatusCodes.CONFLICT).json({
                message : 'Incorrect Current Password',
                description : 'please enter the correct current password'
            })
        }

        foundUser.password = newPassword;
        await foundUser.save();

        //send email for updation of password
        const mailResponse = await sendEmail(userEmail , "Your LogIn Password has been updated Sucessfully.")
        //return response
        return res.status(StatusCodes.OK).json({
            message : 'Your password has been Updated Sucessfully'
        })

    } catch (error) {
        console.log("error while updatting the password in auth of controller" , error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "Error while updating the Password",
        })
    }
}

module.exports = {
    generateOpt,
    signup,
    userLogin,
    updatePassword
}