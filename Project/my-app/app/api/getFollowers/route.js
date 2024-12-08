import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();
        const { userId } = await req.json(); // Get userId from request body

        // use the Useruid to get their followers their username and profile photos
        const user = await User.findById(userId).populate("followers", "username profilePhoto");

        if (!user) {
            console.error("User not found:", userId);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const followers = user.followers || []; // Retrieve followers list

        return NextResponse.json({ followers }); // Return followers with username and profilePhoto
    } catch (error) {
        console.error("Error fetching followers:", error);
        return NextResponse.json({ error: "Failed to fetch followers" }, { status: 500 });
    }
}
