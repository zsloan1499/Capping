import { NextResponse } from 'next/server';
import { connectMongoDB } from "../../../lib/mongodb";
import { User,Song,Review } from "../../../models/User";

//will return the top 50 rated songs
export async function GET(req) {
  try {
    //connect to mongo
    await connectMongoDB();
    console.log("Connected to MongoDB");

    //Fetch all songs from the database
    const songs = await Song.find({});

    // If no songs are found, return an error response
    if (!songs || songs.length === 0) {
      return NextResponse.json({ message: "No songs found" }, { status: 404 });
    }

    //For each song, fetch reviews and calculate the average rating
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

    // Sort the songs by their average rating in descending order
    songsWithAverageRatings.sort((a, b) => b.averageRating - a.averageRating);

    // Limit the list to the top 50 songs
    const top50Songs = songsWithAverageRatings.slice(0, 50);

    // Return the sorted and limited list of songs with their average ratings
    return NextResponse.json(top50Songs);
  } catch (error) {
    console.error("Error:", error);
    // Return an error response with the error message
    return NextResponse.json({ message: "Error fetching top tracks", error: error.message }, { status: 500 });
  }
}
