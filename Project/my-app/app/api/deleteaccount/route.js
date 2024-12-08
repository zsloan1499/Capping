import { connectMongoDB } from "../../../lib/mongodb";
import { NextResponse } from "next/server";
import { User, Song, Review, Playlist } from "../../../models/User"; 

export async function POST(req) {
    try {
        await connectMongoDB();
        const { email } = await req.json();

        // Check if user with provided email exists
        const existingUser = await User.findOne({ email }).select("_id");
        
        if (existingUser) {
            // Delete the user
            await User.deleteOne({ email });

            // Delete all reviews associated with the user
            await Review.deleteMany({ userId: existingUser._id });

            // Delete all songs associated with the user
            await Song.deleteMany({ userId: existingUser._id });

            // Delete all playlists associated with the user
            await Playlist.deleteMany({ userId: existingUser._id });

            return NextResponse.json({
                user: true,
                emailExists: true,
                usernameExists: false,
            });
        }

        return NextResponse.json({ user: false });
    } catch (error) {
        console.error("Error deleting user and associated data:", error);
        return NextResponse.json({ error: "An error occurred during account deletion" }, { status: 500 });
    }
}
