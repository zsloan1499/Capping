import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import { Review, Song } from "../../../models/User"; // Ensure the import paths are correct

export async function POST(req) {
    try {
        const { searchItem, selectedNumber, reviewText, userId } = await req.json(); // Get userId from the request

        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Find song by name or other identifying property
        const song = await Song.findOne({ name: searchItem }); 

        if (!song) {
            return NextResponse.json({ message: "Song not found" }, { status: 404 });
        }

        // Create a new review object
        const newReview = await Review.create({
            song: song._id, // Use the found song's ID
            user: userId,   // Use the current user's ID from the request
            reviewText,
            rating: selectedNumber,
        });

        return NextResponse.json({ message: "Review submitted", review: newReview }, { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ message: "Error submitting review", error: error.message }, { status: 500 });
    }
}
