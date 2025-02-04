const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config()
// OAuth2 setup
const REFRESH_TOKEN = '1//0g8Mc4EAL_oTQCgYIARAAGBASNwF-L9IrEBO7lrf3-4CXaPd83wEWUpQpXmPe7NItqeVYjyKqq5z0OguxzNTCE0P1tbBpMhRFAKU';
async function sendEmail() {
    try {
        const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URI);
        oauth2Client.setCredentials({
            refresh_token: REFRESH_TOKEN
        });
        const accessToken = await oauth2Client.getAccessToken();
        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.SMTP_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });
        // Email options
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: '',
            subject: 'Hello from Nodemailer',
            text: 'Hello! This is a test email.',
            html: '<h1>Hello!</h1><p>This is a test email.</p>',
        };
        // Send Email
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

sendEmail();