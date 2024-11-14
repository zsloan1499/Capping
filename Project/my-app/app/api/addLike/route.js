import { connectMongoDB } from "/lib/mongodb";
import { Review } from "/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB();

        const { reviewId, userId } = await req.json();

        // Validate input
        if (!reviewId) {
            return NextResponse.json({ error: "Invalid review" }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: "Invalid user" }, { status: 400 });
        }

        // Find the review using the find() method (instead of findById)
        const review = await Review.find({ _id: reviewId });

        // If no review found
        if (!review || review.length === 0) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        // Check if user has already liked the review
        const userHasLiked = review[0].likedBy.includes(userId);

        if (userHasLiked) {
            // Remove the like
            review[0].likes -= 1;
            review[0].likedBy = review[0].likedBy.filter(id => id.toString() !== userId);
            console.log('User has unliked the review. Updated likes:', review[0].likes);
        } else {
            // Add the like
            review[0].likes += 1;
            review[0].likedBy.push(userId);
            console.log('User liked the review. Updated likes:', review[0].likes);
        }

        // Save the updated review to the database
        await review[0].save();

        // Return the updated like count
        return NextResponse.json({ likes: review[0].likes });
    } catch (error) {
        console.error("Error processing like:", error);
        return NextResponse.json({ error: "An error occurred while updating like status" }, { status: 500 });
    }
}
