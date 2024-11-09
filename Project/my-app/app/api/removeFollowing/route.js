import { connectMongoDB } from "../../../lib/mongodb"; // Reusing MongoDB connection
import { User } from "../../../models/User";  // Import the User model for MongoDB interactions
import { NextResponse } from 'next/server';  // Import NextResponse for correct response handling

export async function POST(req) {  
    try {
        const { followingId, userId } = await req.json();  // Change followerId to followingId

        // Ensure both followingId and userId are provided
        if (!followingId || !userId) {
            console.error("Invalid request data:", { followingId, userId });
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        // Connect to MongoDB
        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Perform the update for removing the followingId from the user's following array
        const updateUser = await User.updateOne(
            { _id: userId },
            { $pull: { following: followingId } }  // Use followingId here
        );

        // Perform the update for removing the userId from the follower's followers array
        const updateFollower = await User.updateOne(
            { _id: followingId },  // Change followerId to followingId here
            { $pull: { followers: userId } }
        );

        // Check if both updates were successful
        if (updateUser.modifiedCount > 0 && updateFollower.modifiedCount > 0) {
            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            console.error("Failed to remove following:", { updateUser, updateFollower });
            return NextResponse.json({ error: "Failed to remove following" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error removing following:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
