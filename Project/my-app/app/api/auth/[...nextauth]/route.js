import NextAuth from 'next-auth/next';
import CredentialsProvider from "next-auth/providers/credentials";
import { User, Song, Review, Playlist } from "../../../../models/User";
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

                    // Only compare password if user logs in via credentials
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (!passwordsMatch) {
                        console.log("Invalid password");
                        return null;
                    }

                    return user;
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
                    scope: "user-read-email playlist-read-private"
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
            // Only save or update user details if the provider is Google or Spotify
            if (account.provider === "google" || account.provider === "spotify") {
                try {
                    await connectMongoDB();
                    console.log("Connected to MongoDB");

                    // Check if user already exists in the database
                    let user = await User.findOne({ email: profile.email });

                    // If user doesn't exist, call the register API
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
                            })
                        });

                        // Check if the user was created successfully
                        if (res.ok) {
                            const newUser = await res.json();
                            console.log('New user created via API:', newUser);
                        } else {
                            console.error('Failed to create user:', await res.json());
                        }
                    } else {
                        console.log('User already exists:', user);
                    }
                } catch (error) {
                    console.error('Error handling sign in:', error);
                }
            }

            return true;
        },

        async jwt({ token, user }) {
            // Attach additional user information to the token if user is available
            if (user) {
                token.id = user._id;
                token.email = user.email;
                token.fName = user.fName;
                token.lName = user.lName;
                token.username = user.username;
            }

            console.log('JWT Token:', token);
            return token;
        },

        async session({ session, token }) {
            // Attach token information to the session
            if (token) {
                session.user = {
                    id: token.id,
                    email: token.email,
                    fName: token.fName,
                    lName: token.lName,
                    username: token.username,
                };
            }

            console.log('Session data:', session);
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
