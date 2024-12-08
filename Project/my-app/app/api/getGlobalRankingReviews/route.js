import { connectMongoDB } from "/lib/mongodb";
import { Review } from "/models/User"; 
import { NextResponse } from "next/server";

//get the reviews for the top 50 rated songs when click on
export async function POST(req) {
    try {
        await connectMongoDB();

        const { songId } = await req.json();

        if (!songId) {
            return NextResponse.json({ error: "A valid songId is required" }, { status: 400 });
        }

        const reviews = await Review.find({ song: songId })
            .populate("user", "username") // Populate user data
            .select("_id reviewText rating user likes createdAt") // Select required fields
            .sort({ createdAt: -1 }); // Sort by newest first

        if (!reviews.length) {
            return NextResponse.json({ error: "No reviews found for this song" }, { status: 404 });
        }

        const formattedReviews = reviews.map(review => ({
            id: review._id,
            reviewText: review.reviewText,
            rating: review.rating,
            username: review.user.username,
            likes: review.likes.length,  // Count the number of likes in the array
            createdAt: review.createdAt,
        }));
        

        return NextResponse.json({
            reviews: formattedReviews,
            reviewCount: formattedReviews.length,
        });
    } catch (error) {
        console.error("Error fetching song reviews:", error);
        return NextResponse.json({ error: "An error occurred while fetching reviews" }, { status: 500 });
    }
}
