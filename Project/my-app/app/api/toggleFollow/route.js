import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    await connectMongoDB();
    const { userId, friendUsername } = await req.json();

    const currentUser = await User.findById(userId);
    const friendUser = await User.findOne({ username: friendUsername });

    if (!currentUser || !friendUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isFollowing = currentUser.following.includes(friendUsername);

    if (isFollowing) {
        currentUser.following = currentUser.following.filter(user => user !== friendUsername);
        friendUser.followers = friendUser.followers.filter(user => user !== currentUser.username);
    } else {
        currentUser.following.push(friendUsername);
        friendUser.followers.push(currentUser.username);
    }

    await currentUser.save();
    await friendUser.save();

    return NextResponse.json({ success: true });
}
