import NextAuth from 'next-auth/next';
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "../../../../models/User"; 
import { connectMongoDB } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import SpotifyProvider from "next-auth/providers/spotify";
import GoogleProvider from 'next-auth/providers/google';

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
                const { email, password } = credentials;

                try {
                    await connectMongoDB();
                    const user = await User.findOne({ email });

                    if (!user) {
                        console.log("User not found");
                        return null;
                    }

                    // Compare password if user logs in via credentials
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (!passwordsMatch) {
                        console.log("Invalid password");
                        return null;
                    }

<<<<<<< Updated upstream
                    return user; // Return the user object
=======
                    if (!otp) {
                        console.log("No OTP provided. Generating OTP...");
                        const generatedOtp = crypto.randomInt(100000, 999999).toString();
                        user.otp = generatedOtp;
                        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes
                        await user.save();
                        await sendOtpEmail(email, generatedOtp);
                        console.log("OTP sent successfully:", generatedOtp);
                    
                        res.status(200).json({
                            message: "OTP sent to your email. Please re-submit with the OTP.",
                        });
                    }
                    
                    // If OTP is provided, validate it
                    if (otp) {
                        if (otp !== user.otp) {
                            console.log("Invalid OTP provided.");
                            return res.status(401).json({
                                message: "Invalid OTP. Please try again.",
                            });
                        }
                    
                        if (user.otpExpires < Date.now()) {
                            console.log("OTP has expired.");
                            return res.status(401).json({
                                message: "OTP has expired. Please log in again.",
                            });
                        }
                    
                        console.log("OTP validated successfully.");
                        user.otp = null; // Clear OTP after successful validation
                        user.otpExpires = null;
                        await user.save();
                    }

                    
>>>>>>> Stashed changes
                } catch (error) {
                    console.error("Authorization error:", error);
                    return null;
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
            // Handle user creation if the provider is Google or Spotify
            if (account.provider === "google" || account.provider === "spotify") {
                try {
                    await connectMongoDB();
                    console.log("Connected to MongoDB");

                    // Check if user already exists in the database
                    let user = await User.findOne({ email: profile.email });

                    // If user doesn't exist, create a new one
                    if (!user) {
                        const fName = profile.given_name || profile.name?.split(" ")[0];
                        const lName = profile.family_name || profile.name?.split(" ")[1] || "";
                        const username = profile.email.split("@")[0];  // Use part of email for username
                  

                        // Call the register API to create the user
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
                                profilePhoto: profile.picture || "", // Set profile photo
                            })
                        });

                        // Check if the user was created successfully
                        if (res.ok) {
                            const newUser = await res.json();
                            console.log('New user created via API:', newUser);
                            return { ...newUser, profilePhoto: newUser.profilePhoto }; // Return user with profilePhoto
                        } else {
                            console.error('Failed to create user:', await res.json());
                            return null; // Prevent sign-in if user creation fails
                        }
                    } else {
                        console.log('User already exists:', user);
                        return { ...user, profilePhoto: user.profilePhoto }; // Return existing user with profilePhoto
                    }
                } catch (error) {
                    console.error('Error handling sign in:', error);
                }
            }

            return true; // Return true for other cases
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user._id;
                token.email = user.email;
                token.fName = user.fName;
                token.lName = user.lName;
                token.username = user.username; // Ensure updated username
                token.profilePhoto = user.profilePhoto;
            }
            return token;
        },
        
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id,
                    email: token.email,
                    fName: token.fName,
                    lName: token.lName,
                    username: token.username, // Updated username
                    profilePhoto: token.profilePhoto,
                };
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };