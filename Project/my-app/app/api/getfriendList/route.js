import { connectMongoDB } from "../../../lib/mongodb";
import { User, Song, Review, Playlist } from "../../../models/User"; 
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        const { userId } = await req.json();  // Extract userId from the request body

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Get current user's friend list
        const currentUser = await User.findById(userId).select("friends");

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const friendList = currentUser.friends || [];

        // Find users who are not in the current user's friends list
        const users = await User.find({
            _id: { $nin: friendList }, // Exclude users in friend list
        }).select("username");

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "An error occurred while fetching users" }, { status: 500 });
    }
}
