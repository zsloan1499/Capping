'use client';

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

        // Sanitize inputs before using them
        const sanitizedEmail = sanitizeInput(email);
        const sanitizedPassword = sanitizeInput(password);

        try {
            const res = await signIn("credentials", {
                email: sanitizedEmail,
                password: sanitizedPassword,
                redirect: false,
            });

            console.log("signin response", res);

            if (res.error) {
                setError(sanitizeInput("User not found"));
                return;
            }

            router.replace("/dashboard");
            console.log("correct login");
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    // Function to handle Google Sign-in
    const handleGoogleLogin = async () => {
        await signIn('google', { callbackUrl: '/dashboard' });
    };

    return (
        <div>
            <title>Melodi</title>
            <div className="bg-customBlue w-screen h-screen flex items-center justify-center">
                {/* Centered box with shadow */}
                <div className="bg-customBlue2 shadow-lg border-4 border-black p-8 rounded-lg flex flex-col items-center max-w-xl w-full">
                    <div className="text-white text-2xl mb-4">Melodi</div>
                    <div className="flex flex-col items-center">
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
                        {error && (
                            <div className="bg-red-500 text-white text-sm m-2 w-full p-2 rounded">
                                {sanitizeInput(error)}
                            </div>
                        )}
                        <Link className="text-sm text-white m-2" href={"/register"}>
                            Don't have an account? <span className="underline">Register Here</span>
                        </Link>
                        {/* Uncomment this for Google Login */}
                        {/* <button onClick={handleGoogleLogin} className="bg-blue-600 text-white w-full p-2 rounded m-2">Login with Google</button> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
