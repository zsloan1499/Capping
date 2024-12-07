'use client';

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function LoginForm() {
    const router = useRouter(); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState('');
    const [isOtpStep, setIsOtpStep] = useState(false); // For OTP form toggle
    const [error, setError] = useState("");

    // Sanitization function
    const sanitizeInput = (input) => {
        if (typeof input !== "string") return input;
        return input
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const sanitizedEmail = sanitizeInput(email);
        const sanitizedPassword = sanitizeInput(password);
    
        try {
            const res = await signIn("credentials", {
                email: sanitizedEmail,
                password: sanitizedPassword,
                otp, // Pass the OTP field if available
                redirect: false,
            });
    
            if (res?.error) {
                const errorMessage = JSON.parse(res.error).message;
    
                if (errorMessage.includes("OTP sent to your email")) {
                    setIsOtpStep(true); // Switch to OTP input form
                    console.log("Switched to OTP step");
                } else {
                    setError(errorMessage); // Display error
                }
            } else if (res.ok) {
                router.replace("/dashboard"); // Successful login
            } else {
                setError("An unexpected error occurred");
            }
        } catch (error) {
            console.error("Error during login:", error);
            setError("An unexpected error occurred");
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        console.log("OTP submitted:", otp.trim());

        try {
            const res = await signIn("credentials", {
                email, // Already sanitized
                password, // Already sanitized
                otp: sanitizeInput(otp), // Sanitize OTP
                redirect: false,
            });

            console.log("OTP verification response:", res);

            if (res?.error) {
                let errorMessage = res.error;
                try {
                    errorMessage = JSON.parse(res.error).message; // Parse JSON if possible
                } catch (err) {
                    console.error("Error parsing JSON response:", err.message);
                }
                setError(errorMessage);
            } else if (res.ok) {
                router.replace("/dashboard"); // Successful OTP validation
            } else {
                setError("An unexpected error occurred.");
            }
        } catch (error) {
            console.error("Error during OTP verification:", error);
            setError("An unexpected error occurred.");
        }
    };

    return (
        <div>
            <title>Melodi</title>
            <div className="bg-customBlue w-screen h-screen flex items-center justify-center">
                <div className="bg-customBlue2 shadow-lg border-4 border-black p-8 rounded-lg flex flex-col items-center max-w-xl w-full">
                    <div className="text-white text-2xl mb-4">Melodi</div>
                    {isOtpStep ? (
                        // OTP Verification Form
                        <form onSubmit={handleVerifyOtp} className="flex flex-col items-center w-full">
                            <input
                                onChange={e => setOtp(e.target.value)}
                                type="text"
                                placeholder="Enter OTP"
                                className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white"
                            />
                            <button className="bg-green-500 text-white w-full p-2 rounded m-2 font-bold cursor-pointer">
                                Verify OTP
                            </button>
                        </form>
                    ) : (
                        // Login Form
                        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
                            <input
                                onChange={e => setEmail(e.target.value)}
                                type="text"
                                placeholder="Email"
                                className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white"
                            />
                            <input
                                onChange={e => setPassword(e.target.value)}
                                type="password"
                                placeholder="Password"
                                className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white"
                            />
                            <button className="bg-green-500 text-white w-full p-2 rounded m-2 font-bold cursor-pointer">
                                Login
                            </button>
                        </form>
                    )}
                    {error && (
                        <div className="bg-red-500 text-white text-sm m-2 w-full p-2 rounded">
                            {sanitizeInput(error)}
                        </div>
                    )}
                    <Link className="text-sm text-white m-2" href={"/register"}>
                        Don't have an account? <span className="underline">Register Here</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}