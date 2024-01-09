const instance = require('../config/razorpay');
const User = require('../model/user');
const Course = require('../model/courses');
const sendEmail = require('../utils/mailer');
const { StatusCodes } = require('http-status-codes');
const { default: mongoose } = require('mongoose');


//capture the payment and initiate the razorpay order
const capturePayment = async (req,res) => {
    try {
        const {courseId} = req.body;
        const userId = req.user.id;

        if(!courseId){
            console.log('course id was not sent');
            res.status(StatusCodes.NO_CONTENT).json({
                message : 'course id was not sent',
            });
        }

        let fetchedCourse;
        try {
            fetchedCourse = await Course.findById(courseId);
            if(!fetchedCourse){
                console.log('no course found');
                res.status(StatusCodes.NO_CONTENT).json({
                    message : 'course not found from the input course id',
                });
            }

            //now check if the use has already enrolled for the same course or not
            //now the input user id is in the string form but studentsEnrolled finds by taking object id
            //so convert string into object id
            const userIdInObjectIdFrom = new mongoose.Schema.ObjectId(userId);

            if(fetchedCourse.studentsEnrolled.includes(userIdInObjectIdFrom)){
                res.status(StatusCodes.NOT_ACCEPTABLE).json({
                    sucess : false,
                    message : 'you have already purchased this course'
                })
            }

        } catch (error) {
            console.log('something went wrong while fetchig a course from its id');
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message : 'something went wrong while fetchig a course from its id',
                error
            });
        }

        //now all validation done so we can create the order

        const amount = fetchedCourse.price;
        const currency = "INR";

        const options = {
            amount : amount*100,
            currency,
            receipt : Date.now().toString(),
            notes : {
                courseId,
                userId
            }
        }

        try {
            //initiate the payment useing razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log('payment response  : ' , paymentResponse);
            res.status(StatusCodes.OK).json({
                message : 'order created sucessfully',
                sucess : true,
                courseName : fetchedCourse.courseName,
                courseDescription : fetchedCourse.courseDescription,
                thumbnail : fetchedCourse.thumbnail,
                orderId : paymentResponse.id,
                currency : paymentResponse.currency,
                amount : paymentResponse.amount 
            })
        } catch (error) {
            console.log('error whlie creating a order : ' , error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message : 'something went wrong while trying to create order',
                error
            });
        }

    } catch (error) {
        console.log('error whlie creating a order : ' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'something went wrong while trying to create whole order',
            error
        });
    }
}

const verifySignature = async (req,res) => {
    try {
        const webHookSinature = "something";

        const recievedSignature = req.headers["x-razorpay-signature"];

        //the recieved resonse from razorpay is hashed so we cannot decrypt it but we can
        //hash the available secret the same way and check if the match finally

        const shaSum = crypto.createHmac("sha256" , webHookSinature);
        shaSum.update(JSON.stringify(req.body));
        //why req.body?
        const digest = shaSum.digest('hex');

        if(recievedSignature == digest){
            console.log('payment is authorized as signature matched');

            const {courseId , userId} = req.body.payload.entity.notes;

            try {
                //now we have to add the student to the course 
                const courseUpdatedDetails = await Course.findByIdAndUpdate(courseId , {
                    $push : {
                        studentsEnrolled : userId,
                    }
                }, {new : true});
                if(!courseUpdatedDetails){
                    res.status(StatusCodes.NOT_FOUND).json({
                        message : 'error in trying to push user into the course list',
                        error
                    })          
                }

                //also add the course to the student courses list
                const studentUpdatedDetails = await User.findByIdAndUpdate(userId , {
                    $push : {
                        courses : courseId,
                    }
                } , {new : true});
                if(!studentUpdatedDetails){
                    res.status(StatusCodes.NOT_FOUND).json({
                        message : 'error in trying to push course into the student list',
                        error
                    })          
                }

                //send confirmation mail
                const emailResponse = await sendEmail(studentUpdatedDetails.email , "congrats");

                console.log('email response  : ' , emailResponse);
                res.status(StatusCodes.OK).json({
                    message : 'you have been sucessfully enrolled into this course',
                })

            } catch (error) {
                console.log('error after the signature matched');
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message : 'error after the signature matched',
                    error
                })
            }
        }
        else{
            res.status(StatusCodes.BAD_REQUEST).json({
                message : 'the signaature created and recieved does not match',
            })
        }

    } catch (error) {
        console.log('error while verifying signature' , error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : 'error while verifying signature',
            error,
        })
    }
}