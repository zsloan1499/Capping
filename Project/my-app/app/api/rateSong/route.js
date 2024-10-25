import { connectMongoDB } from "../../../lib/mongodb";
import { Song } from "../../../models/User"; // Import Song model from User.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req) {
    try {
        await connectMongoDB();

        const { spotifyId, userId, rating } = await req.json();

        if (!spotifyId) {
            return NextResponse.json({ error: "Spotify ID is required" }, { status: 400 });
        }

        if (rating < 1 || rating > 10) {
            return NextResponse.json({ error: "Rating must be between 1 and 10" }, { status: 400 });
        }

        // Validate userId as a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        let song = await Song.findOne({ spotifyId });
        // If song does not exist, create it
        if (!song) {
            song = new Song({ spotifyId, ratings: [] });
        }

        // Check if the user has already rated the song
        const existingRatingIndex = song.ratings.findIndex(r => r.userId.toString() === userId);
        if (existingRatingIndex > -1) {
            // Update the existing rating
            song.ratings[existingRatingIndex].rating = rating;
        } else {
            // Add new rating entry
            song.ratings.push({ userId, rating });
        }

        await song.save(); // Save the song with the updated ratings
        return NextResponse.json({ message: "Rating submitted" });
    } catch (error) {
        console.error("Error submitting rating:", error);
        return NextResponse.json({ error: "Error submitting rating" }, { status: 500 });
    }
}
