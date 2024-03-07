const instance = require('../config/razorpay');
const User = require('../model/user');
const Course = require('../model/courses');
const sendEmail = require('../utils/mailer');
const { StatusCodes } = require('http-status-codes');
const { default: mongoose } = require('mongoose');
const NewCourseProgress = require('../model/NewCourseProgress');
const crypto = require('crypto');
require('dotenv').config();


//initiate the razorpay order
exports.capturePayment = async(req, res) => {

    const {courses} = req.body;
    const userId = req.user.id;

    console.log("inside the capture payment" , courses);

    if(courses.length === 0) {
        return res.json({success:false, message:"Please provide Course Id"});
    }

    let totalAmount = 0;

    for(const course_id of courses) {
        let course;
        try{
           
            course = await Course.findById(course_id);
            console.log("the course is : " , course);
            if(!course) {
                return res.status(200).json({success:false, message:"Could not find the course"});
            }

            const uid  = new mongoose.Types.ObjectId(userId);
            console.log("the students enrolled in the course are : " , course?.studentsEnrolled);
            if(course?.studentsEnrolled?.includes(uid)) {
                return res.status(200).json({success:false, message:"Student is already Enrolled"});
            }

            totalAmount += course.price;
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }
    const currency = "INR";
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
    }

    console.log("the options are : " , options);

    try{
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success:true,
            message:paymentResponse,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({success:false, mesage:"Could not Initiate Order"});
    }

}


//verify the payment
exports.verifyPayment = async(req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    console.log("inside the verify payment  ");

    if(!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature || !courses || !userId) {
            return res.status(200).json({success:false, message:"Payment Failed"});
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

        if(expectedSignature === razorpay_signature) {
            //enroll karwao student ko
            console.log("the signature matched yeah")
            await enrollStudents(courses, userId, res);
            //return res
            return res.status(200).json({success:true, message:"Payment Verified"});
        }
        return res.status(200).json({success:"false", message:"Payment Failed"});

}


const enrollStudents = async(courses, userId, res) => {

    if(!courses || !userId) {
        return res.status(400).json({success:false,message:"Please Provide data for Courses or UserId"});
    }

    console.log("call went for enrolling students");

    for(const courseId of courses) {
        try{
            //find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
            {_id:courseId},
            {$push:{studentsEnrolled:userId}},
            {new:true},
        )

        if(!enrolledCourse) {
            return res.status(500).json({success:false,message:"Course not Found"});
        }

        const courseProgress = await NewCourseProgress.create({
            courseId:courseId,
            userId:userId,
            completedVideos: [],
        })

        //find the student and add the course to their list of enrolledCOurses
        const enrolledStudent = await User.findByIdAndUpdate(userId,
            {$push:{
                courses: courseId,
                courseProgress: courseProgress._id,
            }},{new:true})
            
        ///bachhe ko mail send kardo
        const emailResponse = await sendEmail(
            enrolledStudent.email,
            `Successfully Enrolled into ${enrolledCourse.courseName}`,
            // courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
        )    
        console.log("Email Sent Successfully", emailResponse);
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }

}

// //capture the payment and initiate the razorpay order
// const capturePayment = async (req,res) => {
//     try {
//         const {courseId} = req.body;
//         const userId = req.user.id;

//         if(!courseId){
//             console.log('course id was not sent');
//             res.status(StatusCodes.NO_CONTENT).json({
//                 message : 'course id was not sent',
//             });
//         }

//         let fetchedCourse;
//         try {
//             fetchedCourse = await Course.findById(courseId);
//             if(!fetchedCourse){
//                 console.log('no course found');
//                 res.status(StatusCodes.NO_CONTENT).json({
//                     message : 'course not found from the input course id',
//                 });
//             }

//             //now check if the use has already enrolled for the same course or not
//             //now the input user id is in the string form but studentsEnrolled finds by taking object id
//             //so convert string into object id
//             const userIdInObjectIdFrom = new mongoose.Schema.ObjectId(userId);

//             if(fetchedCourse.studentsEnrolled.includes(userIdInObjectIdFrom)){
//                 res.status(StatusCodes.NOT_ACCEPTABLE).json({
//                     sucess : false,
//                     message : 'you have already purchased this course'
//                 })
//             }

//         } catch (error) {
//             console.log('something went wrong while fetchig a course from its id');
//             res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//                 message : 'something went wrong while fetchig a course from its id',
//                 error
//             });
//         }

//         //now all validation done so we can create the order

//         const amount = fetchedCourse.price;
//         const currency = "INR";

//         const options = {
//             amount : amount*100,
//             currency,
//             receipt : Date.now().toString(),
//             notes : {
//                 courseId,
//                 userId
//             }
//         }

//         try {
//             //initiate the payment useing razorpay
//             const paymentResponse = await instance.orders.create(options);
//             console.log('payment response  : ' , paymentResponse);
//             res.status(StatusCodes.OK).json({
//                 message : 'order created sucessfully',
//                 sucess : true,
//                 courseName : fetchedCourse.courseName,
//                 courseDescription : fetchedCourse.courseDescription,
//                 thumbnail : fetchedCourse.thumbnail,
//                 orderId : paymentResponse.id,
//                 currency : paymentResponse.currency,
//                 amount : paymentResponse.amount 
//             })
//         } catch (error) {
//             console.log('error whlie creating a order : ' , error);
//             res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//                 message : 'something went wrong while trying to create order',
//                 error
//             });
//         }

//     } catch (error) {
//         console.log('error whlie creating a order : ' , error);
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//             message : 'something went wrong while trying to create whole order',
//             error
//         });
//     }
// }

// const verifySignature = async (req,res) => {
//     try {
//         const webHookSinature = "something";

//         const recievedSignature = req.headers["x-razorpay-signature"];

//         //the recieved resonse from razorpay is hashed so we cannot decrypt it but we can
//         //hash the available secret the same way and check if the match finally

//         const shaSum = crypto.createHmac("sha256" , webHookSinature);
//         shaSum.update(JSON.stringify(req.body));
//         //why req.body?
//         const digest = shaSum.digest('hex');

//         if(recievedSignature == digest){
//             console.log('payment is authorized as signature matched');

//             const {courseId , userId} = req.body.payload.entity.notes;

//             try {
//                 //now we have to add the student to the course 
//                 const courseUpdatedDetails = await Course.findByIdAndUpdate(courseId , {
//                     $push : {
//                         studentsEnrolled : userId,
//                     }
//                 }, {new : true});
//                 if(!courseUpdatedDetails){
//                     res.status(StatusCodes.NOT_FOUND).json({
//                         message : 'error in trying to push user into the course list',
//                         error
//                     })          
//                 }

//                 //also add the course to the student courses list
//                 const studentUpdatedDetails = await User.findByIdAndUpdate(userId , {
//                     $push : {
//                         courses : courseId,
//                     }
//                 } , {new : true});
//                 if(!studentUpdatedDetails){
//                     res.status(StatusCodes.NOT_FOUND).json({
//                         message : 'error in trying to push course into the student list',
//                         error
//                     })          
//                 }

//                 //send confirmation mail
//                 const emailResponse = await sendEmail(studentUpdatedDetails.email , "congrats");

//                 console.log('email response  : ' , emailResponse);
//                 res.status(StatusCodes.OK).json({
//                     message : 'you have been sucessfully enrolled into this course',
//                 })

//             } catch (error) {
//                 console.log('error after the signature matched');
//                 res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//                     message : 'error after the signature matched',
//                     error
//                 })
//             }
//         }
//         else{
//             res.status(StatusCodes.BAD_REQUEST).json({
//                 message : 'the signaature created and recieved does not match',
//             })
//         }

//     } catch (error) {
//         console.log('error while verifying signature' , error);
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//             message : 'error while verifying signature',
//             error,
//         })
//     }
// }