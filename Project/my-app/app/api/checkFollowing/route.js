import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    await connectMongoDB();
    const { userId, friendUsername } = await req.json();

    const currentUser = await User.findById(userId).select("following");
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isFollowing = currentUser.following.includes(friendUsername);
    return NextResponse.json({ isFollowing });
}
