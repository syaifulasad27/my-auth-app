const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config()
//OAUTH
const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URI);
// Step 1: Generate an authorization URL
const AUTHORIZATION_CODE = '4/0ASVgi3JA5P-aqgA2Vy6XKLQrYPYNtRfZk2ANNr-XEt2dlBmv_xpBmm1ozKBMkU6X04XB9w';
// Function to exchange authorization code for access and refresh tokens
async function getTokens() {
    try {
        const { tokens } = await oAuth2Client.getToken(AUTHORIZATION_CODE);
        console.log('Access Token:', tokens.access_token);
        console.log('Refresh Token:', tokens.refresh_token);
        // Set the tokens to the OAuth2 client        
        oAuth2Client.setCredentials(tokens);
        // Optionally, you can use these tokens to make authenticated requests        
    } catch (error) {
        console.error('Error exchanging authorization code for tokens:', error);
    }
}
getTokens();