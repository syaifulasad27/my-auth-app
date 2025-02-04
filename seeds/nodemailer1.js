const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config()
//OAUTH
const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URI);
// Step 1: Generate an authorization URL
const SCOPES = ['https://mail.google.com/']; // Adjust scope as needed
function getAccessToken() {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline', // Required to receive a refresh token
        scope: SCOPES,
    });
    console.log(authUrl);
}
getAccessToken()