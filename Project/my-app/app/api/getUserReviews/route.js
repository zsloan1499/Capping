import { connectMongoDB } from "/lib/mongodb";
import { Review } from "/models/User";
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

        // Find the user's reviews by their userId
        const reviews = await Review.find({ user: userId })
            .populate("song", "name artist")  // Populate song data
            .populate("user", "username")    // Populate user data
            .select("_id reviewText rating song user likes likedBy createdAt") // Select relevant fields including likes and likedBy
            .sort({ createdAt: -1 });        // Sort by most recent reviews first

        if (!reviews || reviews.length === 0) {
            return NextResponse.json({ error: "No reviews found for this user" }, { status: 404 });
        }

        // Map reviews to include the required fields, including likes and likedBy
        const formattedReviews = reviews.map(review => ({
            id: review._id.toString(),  // Map _id to id
            reviewText: review.reviewText,
            rating: review.rating,
            songName: review.song.name,
            songArtist: review.song.artist,
            username: review.user.username,
            likes: review.likes || 0, // Ensure likes has a fallback value
            likedBy: review.likedBy || [], // List of users who liked the review (if applicable)
            createdAt: review.createdAt,
        }));

        return NextResponse.json({
            reviews: formattedReviews,
            reviewCount: reviews.length,
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ error: "An error occurred while fetching reviews" }, { status: 500 });
    }
}
