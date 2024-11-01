import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();
        const { username } = await req.json();

        // Get the user and populate the followers with their username and profilePhoto
        const user = await User.findOne({ username }).populate("followers", "username profilePhoto");

        if (!user) {
            // If no user found, return an empty followers list
            return NextResponse.json({ followers: [] });
        }

        // Return followers (should contain username and profilePhoto)
        return NextResponse.json({ followers: user.followers || [] });
    } catch (error) {
        console.error("Error fetching followers:", error);
        return NextResponse.json({ error: "Failed to fetch followers" });
    }
}
