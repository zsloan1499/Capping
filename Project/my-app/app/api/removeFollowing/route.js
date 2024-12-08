import { connectMongoDB } from "../../../lib/mongodb"; 
import { User } from "../../../models/User";  
import { NextResponse } from 'next/server';  

export async function POST(req) {  
    try {
        const { followingId, userId } = await req.json();  // followingId and userid

        // Ensure both followingId and userId are provided
        if (!followingId || !userId) {
            console.error("Invalid request data:", { followingId, userId });
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        
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
