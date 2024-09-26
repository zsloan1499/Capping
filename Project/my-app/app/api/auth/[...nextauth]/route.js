import NextAuth from 'next-auth/next';
import CredentialsProvider from "next-auth/providers/credentials";
import User from "../../../../models/User"; 
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
                await connectMongoDB();

                let user = await User.findOne({ email: profile.email });

                if (!user) {
                    const newUser = new User({
                        email: profile.email,
                        fName: profile.given_name || profile.name?.split(" ")[0],
                        lName: profile.family_name || profile.name?.split(" ")[1] || "",
                        username: profile.email.split("@")[0],
                        // Do not include the password field for OAuth users
                    });

                    try {
                        await newUser.save();
                    } catch (error) {
                        console.error('Error saving user:', error);
                    }
                }
            }

            return true;
        },
        async jwt({ token, user }) {
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
