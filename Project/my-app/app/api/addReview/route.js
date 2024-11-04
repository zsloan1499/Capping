import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import { Review } from "../../../models/User"; // Ensure Review is imported

export async function POST(req) {
    try {
        const { songId, selectedNumber, reviewText, userId } = await req.json(); // Ensure you're receiving songId

        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Create a new review document
        const newReview = await Review.create({
            song: { id: songId }, // Assuming you want to store the song ID only
            user: userId, // Use the user ID instead of username
            reviewText,
            rating: selectedNumber,
        });

        return NextResponse.json({ message: "Review submitted", review: newReview }, { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ message: "Error submitting review", error: error.message }, { status: 500 });
    }
}
