'use client';

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";



export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const sanitizeInput = (input) => {
        if (typeof input !== "string") return input;
        return input.trim();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
    
        const payload = {
            email: sanitizeInput(email),
            password: sanitizeInput(password),
            otp: isOtpSent ? sanitizeInput(otp) : undefined,
        };
    
        console.log("Frontend Payload:", payload); // Log payload for debugging
    
        try {
            const response = await fetch('/api/auth/[...nextauth]', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
    
            const data = await response.json();
            console.log('Status Code:', response.status);
            console.log('Backend Response:', data);
    
            if (response.ok) {
                if (isOtpSent) {
                    setIsAuthenticated(true);
                    router.push("/dashboard");
                } else if (data.message.includes("OTP sent")) {
                    console.log("OTP sent, switching to OTP form...");
                    setIsOtpSent(true);
                } else {
                    setError("Unexpected response. Please try again.");
                }
            } else {
                setError(data.message || 'An error occurred. Please try again.');
            }
        } catch (err) {
            console.error("Error:", err);
            setError("An error occurred. Please try again.");
        }
    };

    if (isAuthenticated) {
        return <div>Welcome, you are now logged in!</div>;
    }

    return (
        <div className="bg-customBlue w-screen h-screen flex items-center justify-center">
            <div className="bg-customBlue2 shadow-lg border-4 border-black p-8 rounded-lg flex flex-col items-center max-w-xl w-full">
                <div className="text-white text-2xl mb-4">Melodi</div>
                <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        type="text"
                        placeholder="Email"
                        className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white"
                        value={email}
                        required
                    />
                    {!isOtpSent && (
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                            className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white"
                            value={password}
                            required
                        />
                    )}
                    {isOtpSent && (
                        <input
                            onChange={(e) => setOtp(e.target.value)}
                            type="text"
                            placeholder="Enter OTP"
                            className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white"
                            value={otp}
                            required
                        />
                    )}
                    <button className="bg-green-500 text-white w-full p-2 rounded m-2 font-bold cursor-pointer">
                        {isOtpSent ? 'Verify OTP' : 'Login'}
                    </button>
                </form>
                {error && (
                    <div className="bg-red-500 text-white text-sm m-2 w-full p-2 rounded">
                        {error}
                    </div>
                )}
                {!isOtpSent && (
                    <Link className="text-sm text-white m-2" href={"/register"}>
                        Don't have an account? <span className="underline">Register Here</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
