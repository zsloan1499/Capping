import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";  
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();
        const { userId } = await req.json();  // Extract userId from the request body

             // use the Useruid to get their followingtheir username and profile photos
        const user = await User.findById(userId).populate("following", "username profilePhoto");

        if (!user) {
            console.error("User not found:", userId);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return the list of users the current user is following
        const following = user.following || [];

        return NextResponse.json({ following });
    } catch (error) {
        console.error("Error fetching following:", error);
        return NextResponse.json({ error: "Failed to fetch following" }, { status: 500 });
    }
}
