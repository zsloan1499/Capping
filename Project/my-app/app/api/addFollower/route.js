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

        console.log("Current User:", currentUser);

        // Ensure the `following` field is an array
        if (!currentUser.following) {
            currentUser.following = [];
        }

        // Check if the user to follow already exists in the database
        const friendUser = await User.findOne({ username: friendUsername });
        if (!friendUser) {
            return NextResponse.json({ error: "User to follow not found" }, { status: 404 });
        }

        console.log("User to Follow:", friendUser);

        // Check if the user is already in the following list
        if (!currentUser.following.includes(friendUser.username)) {
            currentUser.following.push(friendUser.username); // Store the following user's username
            await currentUser.save();
            console.log(`Added ${friendUser.username} to following list.`);
        } else {
            console.log(`${friendUser.username} is already in the following list.`);
        }

        return NextResponse.json({ success: true, message: "User followed successfully" });
    } catch (error) {
        console.error("Error following user:", error);
        return NextResponse.json({ error: "An error occurred while following the user" }, { status: 500 });
    }
}
