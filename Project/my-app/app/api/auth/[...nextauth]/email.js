import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env

import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
console.log("CLIENT_ID:", process.env.GMAIL_CLIENT_ID);
console.log("CLIENT_SECRET:", process.env.GMAIL_CLIENT_SECRET);
console.log("REFRESH_TOKEN:", process.env.GMAIL_REFRESH_TOKEN);


const oauth2Client = new OAuth2Client(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

oauth2Client.getAccessToken()
    .then(token => console.log("Access Token:", token))
    .catch(err => console.error("Access Token Error:", err));

export async function sendOtpEmail(email, otp) {
    try {
        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: `"Your App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}`,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent:", result);
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw new Error("Could not send OTP email");
    }
}