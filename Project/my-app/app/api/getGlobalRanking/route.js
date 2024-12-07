import { NextResponse } from 'next/server';
import { connectMongoDB } from "../../../lib/mongodb";
import { User,Song,Review } from "../../../models/User";

export async function GET(req) {
  try {
    // Step 1: Connect to the MongoDB database
    await connectMongoDB();
    console.log("Connected to MongoDB");

    // Step 2: Fetch all songs from the database
    const songs = await Song.find({});

    // If no songs are found, return an error response
    if (!songs || songs.length === 0) {
      return NextResponse.json({ message: "No songs found" }, { status: 404 });
    }

    // Step 3: For each song, fetch reviews and calculate the average rating
    const songsWithAverageRatings = await Promise.all(songs.map(async (song) => {
      // Fetch reviews for the song by songId
      const reviews = await Review.find({ song: song._id });

      // Calculate average rating
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;  // If no reviews, average rating is 0

      // Return the song data with its average rating
      return {
        ...song.toObject(),  // Convert song to plain JavaScript object
        averageRating,
      };
    }));

    // Step 4: Sort the songs by their average rating in descending order (highest first)
    songsWithAverageRatings.sort((a, b) => b.averageRating - a.averageRating);

    // Step 5: Limit the list to the top 50 songs
    const top50Songs = songsWithAverageRatings.slice(0, 50);

    // Step 6: Return the sorted and limited list of songs with their average ratings
    return NextResponse.json(top50Songs);
  } catch (error) {
    console.error("Error:", error);
    // Return an error response with the error message
    return NextResponse.json({ message: "Error fetching top tracks", error: error.message }, { status: 500 });
  }
}
