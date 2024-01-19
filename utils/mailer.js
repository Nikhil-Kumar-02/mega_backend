const nodemailer = require('nodemailer');
require('dotenv').config();

let mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.MY_EMAIL,
		pass : process.env.APP_PASSWORD
	}
});

const sendEmail = async (userEmail , body) => {
    let mailDetails = {
        from: process.env.MY_EMAIL,
        to: userEmail,
        subject: 'From StudyNotion',
        html: `
        <h2>${body}<h2>
        `,
    };
    const mailresult =  mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs');
        } else {
            console.log('Email sent successfully');
        }
        return mailresult;
    });
}

module.exports = sendEmail;