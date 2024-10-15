import { connectMongoDB } from "../../../../lib/mongodb";
import { User } from "../../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();
        const { userId, friendUsername } = await req.json();

        // Find the friend to be added by username
        const friend = await User.findOne({ username: friendUsername });

        // Add friend to the user's friend list if they exist
        await User.findByIdAndUpdate(userId, {
            $addToSet: { friends: friend._id } // Add friend if not already added
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "An error occurred while adding friend" });
    }
}
