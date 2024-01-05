const nodemailer = require('nodemailer');
require('dotenv').config();

let mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.MY_EMAIL,
		pass : process.env.APP_PASSWORD
	}
});

const sendEmail = async (userEmail , otp) => {
    let mailDetails = {
        from: process.env.MY_EMAIL,
        to: userEmail,
        subject: 'email/mobile Number verification mail',
        text: `This is Your verification OTP Valid for only 2 Minutes   <h2>${otp}<h2>`
    };
    const mailresult = await mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs');
        } else {
            console.log('Email sent successfully');
        }
        return mailresult;
    });
}

module.exports = sendEmail;