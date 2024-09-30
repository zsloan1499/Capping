
import { connectMongoDB } from "../../../lib/mongodb";
import { NextResponse } from "next/server";
import { User, Song, Review, Playlist } from "../../../models/User";

export async function POST(req) {
    try {
        await connectMongoDB();
        const { email, username } = await req.json();

        // Check if email exists
        const existingUser = await User.findOne({ email }).select("_id");
        // Check if username exists
        const existingUsername = await User.findOne({ username }).select("_id");

        if (existingUser || existingUsername) {
            return NextResponse.json({
                user: true,
                emailExists: !!existingUser,
                usernameExists: !!existingUsername,
            });
        }

        return NextResponse.json({ user: false });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "An error occurred during user existence check" });
    }
}
