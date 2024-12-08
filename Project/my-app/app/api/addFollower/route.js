//imports
import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        //connect to the database
        await connectMongoDB();

        //take the userid and the freind username
        const { userId, friendUsername } = await req.json();

        console.log("Current User ID:", userId);
        console.log("Adding Following Username:", friendUsername);

        // Validate there is userId
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

        // Ensure currentUser.following is an array
        if (!Array.isArray(currentUser.following)) {
            currentUser.following = [];
        }

        // Check if the user to follow exists in the database
        const friendUser = await User.findOne({ username: friendUsername });
        if (!friendUser) {
            return NextResponse.json({ error: "User to follow not found" }, { status: 404 });
        }

        // Ensure friendUser.followers is an array
        if (!Array.isArray(friendUser.followers)) {
            friendUser.followers = [];
        }

        // Check if the user is already in the following list
        if (!currentUser.following.includes(friendUser._id)) {

            // add friend's ObjectId to current user's following array
            currentUser.following.push(friendUser._id);

            // Add current user's ObjectId to friend's followers array
            if (!friendUser.followers.includes(currentUser._id)) {
                friendUser.followers.push(currentUser._id);
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
