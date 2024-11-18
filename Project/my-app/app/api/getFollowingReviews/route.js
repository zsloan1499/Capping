import { connectMongoDB } from "/lib/mongodb";
import { User, Review } from "/models/User"; // Importing the required models
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

        // Find the user and get their following list
        const user = await User.findById(userId).populate("following", "_id");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const followingIds = user.following.map(f => f._id); // Extract ObjectIds of the following list

        if (!followingIds || followingIds.length === 0) {
            return NextResponse.json({ error: "The user is not following anyone" }, { status: 404 });
        }

        let allReviews = []; // Initialize a list to store all reviews

        // Loop through each followed user and fetch their reviews
        for (const followingId of followingIds) {
            const userReviews = await Review.find({ user: followingId }) // Find reviews for this user
                .populate("song", "name artist") // Populate song data
                .populate("user", "username")   // Populate user data
                .select("reviewText rating song user likes likedBy createdAt") // Select necessary fields
                .sort({ createdAt: -1 }); // Sort by newest first

            // Add reviews to the allReviews list
            if (userReviews && userReviews.length > 0) {
                allReviews = [...allReviews, ...userReviews];
            }
        }

        // If no reviews were found for all followed users
        if (allReviews.length === 0) {
            return NextResponse.json({ error: "No reviews found for followed users" }, { status: 404 });
        }

        // Format the reviews for the response
        const formattedReviews = allReviews.map(review => ({
            reviewText: review.reviewText,
            rating: review.rating,
            songName: review.song.name,
            songArtist: review.song.artist,
            username: review.user.username,
            likes: review.likes,
            createdAt: review.createdAt,
        }));

        // Return reviews
        return NextResponse.json({
            reviews: formattedReviews,
            reviewCount: formattedReviews.length,
        });
    } catch (error) {
        console.error("Error fetching following reviews:", error);
        return NextResponse.json({ error: "An error occurred while fetching reviews" }, { status: 500 });
    }
}
