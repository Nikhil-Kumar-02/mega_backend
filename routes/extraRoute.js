const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/mailer');


router.post('/sendMail' , async (req,res) => {
    try {
        const senderMail = req.body.email;
        const mailBody = req.body.mailBody;
        const mailResponse = await sendEmail(senderMail , mailBody);
        return res.status(200).json({
            message : "mail sent sucessfully",
            mailResponse
        })
    } catch (error) {
        console.log('error while sending mail' , error);
    }

})

module.exports = router;