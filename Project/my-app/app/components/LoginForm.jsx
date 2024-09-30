'use client';

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect  } from "react";
import { signOut } from "next-auth/react";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    //handling spotify access token 
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
            exchangeCodeForToken(code);
        }
    },[]);

        // Function to exchange the authorization code for access and refresh tokens
    const exchangeCodeForToken = async (code) => {
        try {
            const response = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + btoa(process.env.NEXT_PUBLIC_S_CLIENT_ID + ":" + process.env.NEXT_PUBLIC_S_CLIENT_SECRET)
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: process.env.NEXT_PUBLIC_S_REDIRECT_URI,
                    client_id: process.env.NEXT_PUBLIC_S_CLIENT_ID,
                    client_secret: process.env.NEXT_PUBLIC_S_CLIENT_SECRET,
                })
            });

            const data = await response.json();

            // Check if the access_token is present
            if (response.ok && data.access_token) {
                // Successfully received access token and refresh token
                console.log("Access Token:", data.access_token);
                console.log("Refresh Token:", data.refresh_token);
                // You can store the access token and use it to make API requests
                await getSpotifyUserProfile(data.access_token);
            } else {
                console.error("Error exchanging code for token:", data.error);
            }
        } catch (error) {
            console.error("Error exchanging code for token:", error);
        }
    };

    // Function to get the user's Spotify profile
    const getSpotifyUserProfile = async (accessToken) => {
        try {
            const response = await fetch("https://api.spotify.com/v1/me", {
                headers: {
                    Authorization: `Bearer ${accessToken}`  // Use the access token here
                }
            });
            if (response.ok) {
                const userData = await response.json();
                console.log("User Profile Data:", userData); // Handle user data as needed
            } else {
                console.error("Error fetching user profile:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };





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
                setError("user not found");
                return;
            }

            router.replace("/dashboard");
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

                    <button onClick={() => signOut({ callbackUrl: '/' })} className="bg-red-600 m-2">Log Out</button>


                    
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