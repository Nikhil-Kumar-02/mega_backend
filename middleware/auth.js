const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
require('dotenv').config();


//auth
const auth = async (req,res,next) => {
    try {
        //extract token
        const {token} = req.cookies.token ||
                        req.body.token ||
                        req.header("Authorisation").replace("Bearer " , '');

        if(!token){
            res.status(StatusCodes.NOT_FOUND).json({
                message : "token not found",
                description : "sign up or log in to create a token"
            })
        }

        //verify token
        try {
            const decodedToken = jwt.verify(token , process.env.JWT_SECRET);
            console.log('the decode user details from the token is : ' , decodedToken);
            //now add this decoded token to the req body
            req.user = decodedToken;
            //user object has all the user details
        } catch (error) {
            console.log('error while verifying token');
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message : "error while verifying token",
                error : error
            })
        }
        next();
    } catch (error) {
        console.log('in auth middleware',error);
        res.status(StatusCodes.BAD_REQUEST).json({
            message : "not able to authenticate a user",
        })
    }
}

//isstudent
const isStudent = async (req,res,next) =>{
    try {
        //req.user because we have added the user details in the user object of req ABOVE
        if(req.user.accountType != "Student"){
            console.log('in is student middle ware try block');
            res.status(StatusCodes.UNAUTHORIZED).json({
                message : 'error while verifying the student',
                description : "you are not a student , this route is only for students"
            })
        }
        next();
    } catch (error) {
        console.log('in is student middle ware');
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while verifying the student'
        })
    }
}


//isadmin
const isAdmin = async (req,res,next) =>{
    try {
        if(req.user.accountType != "Admin"){
            console.log('in is Admin middle ware try block');
            res.status(StatusCodes.UNAUTHORIZED).json({
                message : 'error while verifying the Admin',
                description : "you are not a Admin , this route is only for Admin"
            })
        }
        next();
    } catch (error) {
        console.log('in is Admin middle ware');
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while verifying the Admin'
        })
    }
}


//isinstructor
const isInstructor = async (req,res,next) =>{
    try {
        if(req.user.accountType != "Instructor"){
            console.log('in is Instructor middle ware try block');
            res.status(StatusCodes.UNAUTHORIZED).json({
                message : 'error while verifying the Instructor',
                description : "you are not a Instructor , this route is only for Instructor"
            })
        }
        next();
    } catch (error) {
        console.log('in is Instructor middle ware');
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while verifying the Instructor'
        })
    }
}

module.exports = {
    auth,
    isAdmin,
    isInstructor,
    isStudent
}