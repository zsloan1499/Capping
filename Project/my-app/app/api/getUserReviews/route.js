import { connectMongoDB } from "/lib/mongodb";
import { User, Review, Song } from "/models/User";  // Assuming User, Review, and Song models are in the same file
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();

        // Parse the userId from the request body
        const { userId } = await req.json();

        // Validate userId
        if (!userId) {
            return NextResponse.json({ error: "A valid userId is required" }, { status: 400 });
        }

        // Find the user's reviews by their userId and populate related song data
        const reviews = await Review.find({ user: userId })
            .populate('song', 'name artist')  // Populate the song data (name, artist)
            .select('reviewText rating song'); // Only select review text, rating, and song data

        // If no reviews are found, return an error
        if (!reviews || reviews.length === 0) {
            return NextResponse.json({ error: "No reviews found for this user" }, { status: 404 });
        }

        // Prepare data to return
        const formattedReviews = reviews.map(review => ({
            reviewText: review.reviewText,
            rating: review.rating,
            songName: review.song.name,
            songArtist: review.song.artist,
        }));

        // Return the reviews and the count
        return NextResponse.json({
            reviews: formattedReviews,
            reviewCount: reviews.length,
            averageRating: reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ error: "An error occurred while fetching reviews" }, { status: 500 });
    }
}
