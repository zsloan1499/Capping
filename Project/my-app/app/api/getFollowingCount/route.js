import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();

        const { userId } = await req.json();  // Expecting userId in the request body

        // Validate userId
        if (!userId) {
            return NextResponse.json({ error: "A valid userId is required" }, { status: 400 });
        }

        // Find user by userId
        const user = await User.findById(userId);  // Using userId instead of username

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return the length of the following list
        const followingCount = user.following ? user.following.length : 0;

        return NextResponse.json({ followingCount });
    } catch (error) {
        console.error("Error fetching following count:", error);
        return NextResponse.json({ error: "An error occurred while fetching following count" }, { status: 500 });
    }
}
