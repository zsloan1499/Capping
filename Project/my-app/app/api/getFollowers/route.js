import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();
        const { username } = await req.json();

        // Get followers based on the username
        const user = await User.findOne({ username }).populate("followers", "username profilePhoto");

        return NextResponse.json({ followers: user.followers || [] });
    } catch (error) {
        console.error("Error fetching followers:", error);
        return NextResponse.json({ error: "Failed to fetch followers" });
    }
}