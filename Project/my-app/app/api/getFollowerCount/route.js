import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();

        const { userId } = await req.json();  //  userId in the request body

        // Validate userId
        if (!userId) {
            return NextResponse.json({ error: "A valid userId is required" }, { status: 400 });
        }

        // Count users who have the specified userId in their 'following' list
        const followerCount = await User.countDocuments({ following: userId });

        return NextResponse.json({ followerCount });
    } catch (error) {
        console.error("Error fetching follower count:", error);
        return NextResponse.json({ error: "An error occurred while fetching follower count" }, { status: 500 });
    }
}
