import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        const { username } = await req.json();  // Extract username from the request body

        // Validate username
        if (!username) {
            return NextResponse.json({ error: "A valid username is required" }, { status: 400 });
        }

        // Find user by username
        const user = await User.findOne({ username }).select("username profilePhoto");

        // Check if user exists
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Respond with user's profile information
        return NextResponse.json({ username: user.username, profilePhoto: user.profilePhoto });
    } catch (error) {
        console.error("Error fetching user info:", error);
        return NextResponse.json({ error: "An error occurred while fetching user data" }, { status: 500 });
    }
}
