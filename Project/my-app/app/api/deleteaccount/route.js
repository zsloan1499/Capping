import { connectMongoDB } from "../../../lib/mongodb";
import { NextResponse } from "next/server";
import { User, Song, Review, Playlist } from "../../../models/User"; 

export async function POST(req) {
    try {
        await connectMongoDB();
        const { email } = await req.json();

        // Check if email exists
        const existingUser = await User.findOne({ email }).select("_id");
        
        if (existingUser) {
            // Delete the existing user
            await User.deleteOne({ email });

            return NextResponse.json({
                user: true,
                emailExists: true,
                usernameExists: false,
            });
        }

        return NextResponse.json({ user: false });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "An error occurred during user existence check" });
    }
}
