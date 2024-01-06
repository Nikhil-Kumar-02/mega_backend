const otpGenerator = require('otp-generator');
const OTP_Model = require('../model/otp');
const User = require('../model/user');
const {StatusCodes} = require('http-status-codes');
const Profile= require('../model/profile');

//send otp as to create account we have to verify the mail
const generateOpt = async (req,res) => {
    try {
        //first generate opt from the package
        const {email} = req.body;

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
        //also we have to save this opt for verification
        //both logic in the otp model to send it to that model as prehook exists there
        await OTP_Model.create({email , otp : generatedOTP});
        //now to that email this otp has been sent and then on sucessful transmission an instance will
        //be generated into the db with the email and opt which will be deleted after 5 mins

        res.status(StatusCodes.OK).json({
            message : "otp Sent sucessfully"
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
        const {firstName , lastName , email , accountType , phoneNumber , password , otp} = req.body;
        console.log('the incoming body : ' , req.body);

        //we have done all validations before so all data is present and email is valid and new

        //check is otp present or not
        if(!otp){
            res.status(StatusCodes.NO_CONTENT).json({
                message : 'otp not present',
                description : 'please fill the otp'
            })
        }

        //find the alloted otp of this user
        const usersOTP = await OTP_Model.find(email).sort({ createdAt: -1 }).limit(1).exec();
        
        if(!usersOTP || usersOTP.length == 0){
            res.status(StatusCodes.NOT_FOUND).json({
                message : "not otp is present",
                description : "either otp not generated or passed the time limit to verify"
            })
        }

        if(usersOTP.otp != otp){
            res.status(StatusCodes.NOT_ACCEPTABLE).json({
                message : "otp does not match",
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

        res.status(StatusCodes.CREATED).json({
            message : "user created",
            description : "your account has been sucessfully created and varified"
        })
    } catch (error) {
        console.log('error while signing in :' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "account not created",
            description : "your account was not created due to some unexpected error",
            error : error
        })
    }

}


//login



//this is when you know the current password and still want to change it to new password due to 
//security reasons

//change password
