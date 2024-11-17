import { connectMongoDB } from "../../../lib/mongodb";
import { Review, Song, User } from "../../../models/User"; // Ensure both Review, Song, and User models are imported
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Parse incoming data from the request
        const { songName, selectedNumber, reviewText, userId, spotifyId, artist } = await req.json(); // added artist

        // Connect to the MongoDB database
        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Ensure all necessary fields are present
        if (!songName || !selectedNumber || !reviewText || !userId || !spotifyId || !artist) { // added artist to the validation
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // Step 1: Check if the song already exists in the database
        let song = await Song.findOne({ name: songName, spotifyId: spotifyId });

        // Step 2: If the song is not found, add a new song with Spotify ID and artist
        if (!song) {
            song = await Song.create({
                name: songName,
                spotifyId: spotifyId,
                artist: artist,  // Add the artist field here
            });
            console.log("New song added to database:", song);
        }

        // Ensure song._id is available
        if (!song._id) {
            throw new Error("Failed to retrieve or create song ID.");
        }

        // Step 3: Create a new review document with the song's ID
        const newReview = await Review.create({
            song: song._id, // Reference only the song ID
            user: userId,   // Reference the user ID who is posting the review
            reviewText,
            rating: selectedNumber,
        });

        // Step 4: Add the new review ID to the user's reviews array
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found.");
        }

        // Push the new review ID to the user's reviews array
        user.reviews.push(newReview._id);

        // Save the updated user document
        await user.save();
        console.log("Review ID added to user:", user);

        // Return a success response with the review data
        return NextResponse.json({ message: "Review submitted", review: newReview }, { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        // Return an error response with the error message
        return NextResponse.json({ message: "Error submitting review", error: error.message }, { status: 500 });
    }
}
