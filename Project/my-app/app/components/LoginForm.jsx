'use client';

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect  } from "react";
import { signOut } from "next-auth/react";

const Spotify_Client_ID = "6b3bcfdc3fee47028cd6628a5959ee45"; 
const Spotify_Redirect_URI = "http://localhost:3000/dashboard";

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


    const handleSpotifyLogin = async () => {
            const params = new URLSearchParams({
              response_type: 'code',
              client_id: process.env.NEXT_PUBLIC_S_CLIENT_ID,// Spotify Client ID from .env
              redirect_uri: process.env.NEXT_PUBLIC_S_REDIRECT_URI,// Redirect URI from .env
              scope: "user-read-email playlist-read-private"
            });
            const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' + params.toString(); 

            window.location.href = spotifyAuthUrl; 
    }; 

    // Function to handle Google Sign-in
    const handleGoogleLogin = async () => {
         await signIn('google', { callbackUrl: '/dashboard' });
    };

    
    return (
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
                    {error && (
                        <div className="bg-red-500 text-white text-sm m-2 w-fit ">
                            {error}
                        </div>
                    )}
                    <Link className="text-sm m-2" href={"/register"}>
                        Don't have an account? <span className="underline">Register Here</span>
                    </Link>

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="bg-blue-600 text-white p-2 m-2 rounded">
                        Login with Google
                    </button>

                    
                    {/* Spotify Login Button */}
                    <button
                        onClick={handleSpotifyLogin}
                        className="bg-green-600 text-white flex items-center p-2 m-2 rounded">
                        <span className="mr-2">Login with Spotify</span>
                    </button>
                </div>
            </div>
    );
}