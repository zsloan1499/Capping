import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    await connectMongoDB();
    const { userId, friendUsername } = await req.json();

    // Find the user document of the friend using the username
    const friend = await User.findOne({ username: friendUsername }).select("_id");
    if (!friend) {
        return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    // Find the current user and check if the friend is in the following list
    const currentUser = await User.findById(userId).select("following");
    if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the friend is in the current user's following list
    const isFollowing = currentUser.following.includes(friend._id);
    
    return NextResponse.json({ isFollowing });
}
