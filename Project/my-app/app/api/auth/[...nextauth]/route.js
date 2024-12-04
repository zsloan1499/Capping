import NextAuth from 'next-auth/next';
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "../../../../models/User"; 
import { connectMongoDB } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import SpotifyProvider from "next-auth/providers/spotify";
import GoogleProvider from 'next-auth/providers/google';
import crypto from "crypto";
import { sendOtpEmail } from "./email.js";

const ZACH_GOOGLE_CLIENT_ID = process.env.ZACH_GOOGLE_CLIENT_ID;
const ZACH_GOOGLE_SECRET = process.env.ZACH_GOOGLE_SECRET;


export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: ZACH_GOOGLE_CLIENT_ID,
            clientSecret: ZACH_GOOGLE_SECRET
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {},
            async authorize(credentials) {
                console.log("API Route /api/auth/[...nextauth] invoked.");

                const { email, password, otp } = credentials;

                console.log("Incoming Request Body:", credentials);
                console.log("Request Email:", credentials.email);
                console.log("Request Password:", credentials.password ? "Provided" : "Not Provided");
                console.log("Request OTP:", credentials.otp ? credentials.otp : "Not Provided");


                console.log("Route handler invoked with method:", req.method);

                console.log("Authorization process started...");
                await connectMongoDB();
                console.log("Connected to MongoDB");

                try {
                    const user = await User.findOne({ email });

                    if (!user) {
                        console.log("User not found.");
                        return null; // Return null for missing users in NextAuth `authorize`
                    }

                    if (!email) {
                        console.log("Error: Missing email.");
                        return res.status(400).json({ message: "Email is required." });
                    }
                    
                    if (!password && !otp) {
                        console.log("Error: Missing password or OTP.");
                        return res.status(400).json({ message: "Password or OTP is required." });
                    }

                    if (!otp) {
                        console.log("No OTP provided. Generating OTP...");
                        const generatedOtp = crypto.randomInt(100000, 999999).toString();
                        user.otp = generatedOtp;
                        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes
                        await user.save();
                    
                        await sendOtpEmail(email, generatedOtp);
                        console.log("OTP sent successfully:", generatedOtp);
                        throw new Error("OTP sent to your email. Please re-submit with the OTP.");
                    }
                    
                    console.log("Validating OTP...");
                    if (otp !== user.otp || new Date() > user.otpExpires) {
                        console.log("Invalid or expired OTP.");
                        throw new Error("Invalid or expired OTP.");
                    }
                    
                    console.log("OTP validated successfully.");
                    user.otp = null;
                    user.otpExpires = null;
                    await user.save();
                    return user;

                    
                } catch (error) {
                    console.error("Error during authorization:", error.message);
                    throw new Error(error.message);
                }
            },
        }),
        SpotifyProvider({
            clientId: process.env.NEXT_PUBLIC_S_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_S_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: "user-read-email playlist-read-private user-top-read user-read-recently-played playlist-read-private playlist-read-collaborative"
                },
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/",
    },
    callbacks: {
        async signIn({ account, profile }) {
            console.log("Sign-in process triggered...");
            if (account.provider === "google" || account.provider === "spotify") {
                try {
                    await connectMongoDB();
                    console.log("Connected to MongoDB during sign-in");

                    let user = await User.findOne({ email: profile.email });

                    if (!user) {
                        console.log("Creating a new user for sign-in...");
                        const fName = profile.given_name || profile.name?.split(" ")[0];
                        const lName = profile.family_name || profile.name?.split(" ")[1] || "";
                        const username = profile.email.split("@")[0];

                        const res = await fetch('../../register', {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                fName,
                                lName,
                                username,
                                email: profile.email,
                                password: "", // No password for OAuth users
                                profilePhoto: profile.picture || "",
                            })
                        });

                        if (res.ok) {
                            const newUser = await res.json();
                            console.log('New user created via API:', newUser);
                            return { ...newUser, profilePhoto: newUser.profilePhoto };
                        } else {
                            console.error('Failed to create user during sign-in:', await res.json());
                            return null;
                        }
                    } else {
                        console.log('User already exists during sign-in:', user);
                        return { ...user, profilePhoto: user.profilePhoto };
                    }
                } catch (error) {
                    console.error('Error during sign-in:', error);
                    return null;
                }
            }

            return true;
        },

        async jwt({ token, user }) {
            console.log("JWT callback triggered...");
            if (user) {
                token.id = user._id;
                token.email = user.email;
                token.fName = user.fName;
                token.lName = user.lName;
                token.username = user.username;
                token.profilePhoto = user.profilePhoto;
            }
            return token;
        },
        
        async session({ session, token }) {
            console.log("Session callback triggered...");
            if (token) {
                session.user = {
                    id: token.id,
                    email: token.email,
                    fName: token.fName,
                    lName: token.lName,
                    username: token.username,
                    profilePhoto: token.profilePhoto,
                };
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };