import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";  
import { NextResponse } from 'next/server';  

export async function POST(req) {  
    try {
        const { followerId, userId } = await req.json();  // Extract followerId and userId from the request body

        // Ensure both followerId and userId are provided
        if (!followerId || !userId) {
            console.error("Invalid request data:", { followerId, userId });
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }


        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Perform the update for removing the follower from the user's followers array
        const updateUser = await User.updateOne(
            { _id: userId },
            { $pull: { followers: followerId } }
        );

        // Perform the update for removing the user from the follower's following array
        const updateFollower = await User.updateOne(
            { _id: followerId },
            { $pull: { following: userId } }
        );

        // Check if both updates were successful
        if (updateUser.modifiedCount > 0 && updateFollower.modifiedCount > 0) {
            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            console.error("Failed to remove follower:", { updateUser, updateFollower });
            return NextResponse.json({ error: "Failed to remove follower" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error removing follower:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
