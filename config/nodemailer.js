const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const REFRESH_TOKEN = '1//0g8Mc4EAL_oTQCgYIARAAGBASNwF-L9IrEBO7lrf3-4CXaPd83wEWUpQpXmPe7NItqeVYjyKqq5z0OguxzNTCE0P1tbBpMhRFAKU';

async function transporter() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.BASE_URL
    );
    oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN,
    });

    const accessToken = await oauth2Client.getAccessToken();

    return nodemailer.createTransport({
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
}

module.exports.transporter = transporter;
