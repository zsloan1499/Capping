import { connectMongoDB } from "../../../lib/mongodb";
import { Review, Song } from "../../../models/User"; // Import Song model from User.js
import { NextResponse } from "next/server";

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

        // Find or create a Song based on spotifyId
        let song = await Song.findOne({ spotifyId });//This checks if a Song document already exists with the spotifyId.
        if (!song) {
            song = new Song({ spotifyId, name: "Unknown", artist: "Unknown" });// If the song doesn’t exist, we create a new Song with the spotifyId
            await song.save();
        }

        // Find or create a Review based on song ID
        let review = await Review.findOne({ song: song._id }); //This searches for a Review document that references the Song’s _id.
        if (!review) {
            review = new Review({ song: song._id, ratings: [] }); //If no Review is found, we create a new one with the song field set to song._id and an empty ratings array to start with.
        }

        await Review.save(); // Save the song with the updated ratings
        return NextResponse.json({ message: "Rating submitted" });
    } catch (error) {
        console.error("Error submitting rating:", error);
        return NextResponse.json({ error: "Error submitting rating" }, { status: 500 });
    }

        // Check if the user has already rated the song (not sure if we will need this)
/*      const existingRatingIndex = Review.ratings.findIndex(r => r.userId.toString() === userId);
        if (existingRatingIndex > -1) {
            // Update the existing rating
            Review.ratings[existingRatingIndex].rating = rating;
        } else {
            // Add new rating entry
            Review.ratings.push({ userId, rating });
        }
*/
}
