import dotenv from "dotenv";
import { sendOtpEmail } from "./email.js"; // Adjust the path based on where email.js is located

dotenv.config(); // Load environment variables

async function testEmail() {
    const recipientEmail = "camcat922@gmail.com"; // Replace with the test recipient's email
    const otp = "123456"; // Test OTP value

    try {
        await sendOtpEmail(recipientEmail, otp);
        console.log("Test email sent successfully!");
    } catch (error) {
        console.error("Failed to send test email:", error);
    }
}

testEmail();