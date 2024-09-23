import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "../../../../models/User"; 
import { connectMongoDB } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import SpotifyProvider from "next-auth/providers/spotify";


export const authOptions = {
    providers: [
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

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (!passwordsMatch) {
                        console.log("Invalid password");
                        return null;
                    }

                    console.log("Authorized user:", user); 
                    return user;
                } catch (error) {
                    console.error("Authorization error:", error);
                    return null;
                }
            },
        }),

        SpotifyProvider({
            clientId: process.env.S_CLIENT_ID, 
            clientSecret: process.env.S_CLIENT_SECRET,
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
        async jwt({ token, user }) {
            if (user) {

                token.id = user._id;
                token.email = user.email;
                token.fName = user.fName;
                token.lName = user.lName;
                token.username = user.username;
            }
            if(account?.provider === "spotify"){
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token; 
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
                session.accessToken = token.accessToken; 
                session.refreshToken = token.refreshToken; 
            }
            console.log('Session data:', session); 
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
