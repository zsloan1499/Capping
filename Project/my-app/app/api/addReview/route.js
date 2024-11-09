import { connectMongoDB } from "../../../lib/mongodb";
import { Review, Song, User } from "../../../models/User"; // Ensure both Review, Song, and User models are imported
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { songName, artist, selectedNumber, reviewText, userId, spotify } = await req.json();

        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Ensure all necessary fields are present
        if (!songName || !artist || !selectedNumber || !reviewText || !userId) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // Step 1: Check if the song already exists in the database
        let song = await Song.findOne({ name: songName, artist: artist });

        // Step 2: If the song is not found, add a new song
        if (!song) {
            song = await Song.create({ name: songName, artist: artist });
            console.log("New song added to database:", song);
        }

        // Ensure song._id is available
        if (!song._id) {
            throw new Error("Failed to retrieve or create song ID.");
        }

        // Step 3: Create a new review document with the song's ID
        const newReview = await Review.create({
            song: song._id, // Reference only the song ID
            user: userId, // Ensure user ID is passed and valid
            reviewText,
            rating: selectedNumber,
            spotifyId: spotify,
        });

        // Step 4: Add the new review ID to the user's reviews array
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found.");
        }

        // Push the new review ID to the user's review array
        user.reviews.push(newReview._id);

        // Save the updated user document
        await user.save();
        console.log("Review ID added to user:", user);

        return NextResponse.json({ message: "Review submitted", review: newReview }, { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ message: "Error submitting review", error: error.message }, { status: 500 });
    }
}
