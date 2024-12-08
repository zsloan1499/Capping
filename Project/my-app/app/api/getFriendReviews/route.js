
import { connectMongoDB } from "../../../lib/mongodb";
import { User, Review } from "/models/User";
import { NextResponse } from "next/server";

//will get the reviews for a specific friend
export async function POST(req) {
    await connectMongoDB();

    const { username } = await req.json(); // Expect username in the request
    try {
        // Find user by username to get their userId
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Query reviews by userId
        const reviews = await Review.find({ user: user._id })
            .populate('song', 'name artist') 
            .populate('user', 'username');

        return NextResponse.json({ reviews });
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}
