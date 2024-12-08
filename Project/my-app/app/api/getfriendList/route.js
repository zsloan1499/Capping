import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Connect to Mongo
        await connectMongoDB();

        const { userId } = await req.json();  // User if from request

        // Validate userId
        if (!userId) {
            return NextResponse.json({ error: "A valid User ID is required" }, { status: 400 });
        }

        // Get current user's following list
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Use IDs in the following list
        const followingIds = currentUser.following || [];

        // get  all users who are not in the current users following list and exclude the current user
        const users = await User.find({
            _id: { $nin: followingIds, $ne: userId } // Exclude users in following list and the current user
        }).select("username");

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "An error occurred while fetching users" }, { status: 500 });
    }
}
