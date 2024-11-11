import { connectMongoDB } from "../../../lib/mongodb";
import { User, Review, Song } from "/models/User"; // Ensure the Song model has title and artist
import { NextResponse } from "next/server";

export async function POST(req) {
    await connectMongoDB();
    const { userId } = await req.json();

    try {
        // Populate the song reference in each review
        const reviews = await Review.find({ userId })
            .populate('song', 'title artist') // 'song' is the reference field in Review, and 'title artist' are the fields you want to populate
            .populate('user', 'username'); // Optionally, populate the user reference if needed
        
        return NextResponse.json({ reviews });
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}
