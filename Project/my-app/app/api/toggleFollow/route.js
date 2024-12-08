import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

//follow or unfollow a user
export async function POST(req) {
    await connectMongoDB();
    const { userId, friendUsername } = await req.json();

    // Find the current user and friend user by ID and username, respectively
    const currentUser = await User.findById(userId);
    const friendUser = await User.findOne({ username: friendUsername });

    if (!currentUser || !friendUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the current user is following the friend user using their ID
    const isFollowing = currentUser.following.includes(friendUser._id);

    if (isFollowing) {
        // If following, remove the friend's ID from the current user's following list
        currentUser.following = currentUser.following.filter(id => !id.equals(friendUser._id));
        // Remove the current user's ID from the friend's followers list
        friendUser.followers = friendUser.followers.filter(id => !id.equals(currentUser._id));
    } else {
        // Otherwise, add the friend's ID to the current user's following list
        currentUser.following.push(friendUser._id);
        // Add the current user's ID to the friend's followers list
        friendUser.followers.push(currentUser._id);
    }

    // Save changes to the database
    await currentUser.save();
    await friendUser.save();

    return NextResponse.json({ success: true });
}
