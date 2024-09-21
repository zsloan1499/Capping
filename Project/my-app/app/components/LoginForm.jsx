'use client';

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { signOut } from "next-auth/react";


const clientId = "877616753121-6hui2g63bsdib7mmt1udbrleufdhvgaj.apps.googleusercontent.com";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            console.log("signin response", res);

            if (res.error) {
                setError("error logging in");
                return;
            }

            router.replace("dashboard");
            console.log("correct login");
        } catch (error) {
            console.log("error")
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const res = await signIn("google", {
                redirect: false,
            });
    
            if (res?.error) {
                console.log("Google login error:", res.error);
                setError("Error logging in with Google");
            } else {
                router.replace("/dashboard");
            }
        } catch (error) {
            console.error("Google login failed:", error);
        }
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
        <div>
            <div className="m-2">Login Form</div>
            <div>
                <form onSubmit={handleSubmit}>
                    <input onChange={e => setEmail(e.target.value)} type="text" placeholder="Email" className="border border-gray-900 m-2" />
                    <br />
                    <input onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="border border-gray-900 m-2" />
                    <br />
                    <button className="bg-green-500 m-2 text-white w-16 font-bold cursor-pointer">Login</button>
                </form>
                <button onClick={() => signOut({ callbackUrl: '/' , redirect: true})} className="bg-red-600 m-2">Log Out</button>
                {error && (
                    <div className="bg-red-500 text-white text-sm m-2 w-fit ">
                        {error}
                    </div>
                )}
                <Link className="text-sm  m-2" href={"/register"}>
                    Don't have an account? <span className="underline">Register Here</span>
                </Link>
                <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log("Login Failed")}
                />
            </div>
        </div>
        </GoogleOAuthProvider>
    );
}