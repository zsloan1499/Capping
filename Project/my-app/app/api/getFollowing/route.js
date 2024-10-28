import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();
        const { username } = await req.json();

        // Get following users based on the username
        const user = await User.findOne({ username }).populate("following", "username profilePhoto");

        return NextResponse.json({ following: user.following || [] });
    } catch (error) {
        console.error("Error fetching following:", error);
        return NextResponse.json({ error: "Failed to fetch following" });
    }
}