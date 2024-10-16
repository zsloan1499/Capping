import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();

        const { userId, friendUsername } = await req.json();

        console.log("Current User ID:", userId);
        console.log("Adding Friend Username:", friendUsername);

        // Validate userId
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Validate friendUsername
        if (!friendUsername || typeof friendUsername !== 'string') {
            return NextResponse.json({ error: "Friend's username is required and must be a string" }, { status: 400 });
        }

        // Find the current user by ID
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.log("Current User:", currentUser);

        // Ensure the `friends` field is an array
        if (!currentUser.friends) {
            currentUser.friends = [];
        }

        // Check if the friend already exists in the database
        const friendUser = await User.findOne({ username: friendUsername });
        if (!friendUser) {
            return NextResponse.json({ error: "Friend not found" }, { status: 404 });
        }

        console.log("Friend User:", friendUser);

        // Check if the friend is already in the friends list
        if (!currentUser.friends.includes(friendUser.username)) {
            currentUser.friends.push(friendUser.username); // Store the friend's username
            await currentUser.save();
            console.log(`Added ${friendUser.username} to friends list.`);
        } else {
            console.log(`${friendUser.username} is already in the friends list.`);
        }

        return NextResponse.json({ success: true, message: "Friend added successfully" });
    } catch (error) {
        console.error("Error adding friend:", error);
        return NextResponse.json({ error: "An error occurred while adding friend" }, { status: 500 });
    }
}
