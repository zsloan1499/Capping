import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();

        const { userId, friendUsername } = await req.json();

        console.log("Current User ID:", userId);
        console.log("Adding Following Username:", friendUsername);

        // Validate userId
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Validate friendUsername
        if (!friendUsername || typeof friendUsername !== 'string') {
            return NextResponse.json({ error: "Following user's username is required and must be a string" }, { status: 400 });
        }

        // Find the current user by ID
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Ensure the `following` field is an array
        if (!currentUser.following) {
            currentUser.following = [];
        }

        // Check if the user to follow exists in the database
        const friendUser = await User.findOne({ username: friendUsername });
        if (!friendUser) {
            return NextResponse.json({ error: "User to follow not found" }, { status: 404 });
        }

        // Ensure the `followers` field is an array for the user being followed
        if (!friendUser.followers) {
            friendUser.followers = [];
        }

        // Check if the user is already in the following list
        if (!currentUser.following.includes(friendUser.username)) {
            currentUser.following.push(friendUser.username); // Store the following user's username

            // Also add the current user to the friendUser's followers array
            if (!friendUser.followers.includes(currentUser.username)) {
                friendUser.followers.push(currentUser.username);
            }

            // Save both the current user and the friend user
            await currentUser.save();
            await friendUser.save();

            console.log(`Added ${friendUser.username} to following list and ${currentUser.username} to ${friendUser.username}'s followers list.`);
        } else {
            console.log(`${friendUser.username} is already in the following list.`);
        }

        return NextResponse.json({ success: true, message: "User followed successfully" });
    } catch (error) {
        console.error("Error following user:", error);
        return NextResponse.json({ error: "An error occurred while following the user" }, { status: 500 });
    }
}
