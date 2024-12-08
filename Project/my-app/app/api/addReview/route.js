import { connectMongoDB } from "../../../lib/mongodb";
import { Review, Song, User } from "../../../models/User"; // Ensure models are imported
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    //  incoming  from the request
    const { songName, selectedNumber, reviewText, userId, spotifyId, artist, genres } = await req.json(); // added artist and genres

    // Connect to the MongoDB database
    await connectMongoDB();
    console.log("Connected to MongoDB");

    // Ensure all necessary fields are present
    if (!songName || !selectedNumber || !reviewText || !userId || !spotifyId || !artist) { // added artist to the validation
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check if the song already exists in the database
    let song = await Song.findOne({ spotifyId });

    //If the song is not found, add a new song with Spotify ID, artist, and genres
    if (!song) {
      // If genres are provided, use them; otherwise, default to an empty array
      song = await Song.create({
        name: songName,
        spotifyId,
        artist,
        genres: genres && genres.length > 0 ? genres : [], // Ensure genres is an array (default to empty array if undefined or empty)
      });
      console.log("New song added to database:", song);
    } else {
      // If the song exists, update it with new genres if provided (to keep it up to date)
      if (genres && genres.length > 0) {
        song.genres = genres;
        await song.save();
        console.log("Song genres updated:", song);
      }
    }

    // Ensure song._id is available
    if (!song._id) {
      throw new Error("Failed to retrieve or create song ID.");
    }

    //  Create a new review document with the song's ID
    const newReview = await Review.create({
      song: song._id, // Reference only the song ID
      user: userId,   // Reference the user ID who is posting the review
      reviewText,
      rating: selectedNumber,
    });

    //  Add the new review ID to the user's reviews array
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
