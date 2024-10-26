import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();

        const { username } = await req.json();

        // Validate username
        if (!username) {
            return NextResponse.json({ error: "A valid username is required" }, { status: 400 });
        }

        // Count users who have the specified user in their 'following' list
        const followerCount = await User.countDocuments({ following: username });

        return NextResponse.json({ followerCount });
    } catch (error) {
        console.error("Error fetching follower count:", error);
        return NextResponse.json({ error: "An error occurred while fetching follower count" }, { status: 500 });
    }
}
