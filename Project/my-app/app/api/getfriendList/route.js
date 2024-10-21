import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        const { userId } = await req.json();  // Extract userId from the request body

        // Validate userId
        if (!userId) {
            return NextResponse.json({ error: "A valid User ID is required" }, { status: 400 });
        }

        // Get current user's following list
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const followingList = currentUser.following || []; // This should contain usernames

        // Fetch usernames of the users that are followed by the current user
        const followedUsernames = await User.find({
            username: { $in: followingList },
        }).select("username");

        const followedUsernamesArray = followedUsernames.map(user => user.username); // Extract usernames

        // Find users who are not in the current user's following list and exclude the current user
        const users = await User.find({
            username: { $nin: followedUsernamesArray }, // Exclude users in following list
            _id: { $ne: userId }, // Exclude the current user by ID
        }).select("username");

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "An error occurred while fetching users" }, { status: 500 });
    }
}
