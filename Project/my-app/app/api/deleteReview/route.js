import { connectMongoDB } from "/lib/mongodb";
import { User, Review } from "/models/User";  // Ensure you're importing the User model
import { NextResponse } from "next/server";

export async function DELETE(req) {
    try {
        const { reviewId, userId } = await req.json(); // Expecting reviewId and userId in the request body

        // Check if reviewId or userId are missing
        if (!reviewId || !userId) {
            return NextResponse.json({ error: "Review ID and User ID are required" }, { status: 400 });
        }

        await connectMongoDB();

        // Check if the review exists
        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        // Check if the user is the owner of the review or has permission to delete it
        if (review.user.toString() !== userId) {
            return NextResponse.json({ error: "You do not have permission to delete this review" }, { status: 403 });
        }

        // Delete the review from the Review collection
        await Review.findByIdAndDelete(reviewId);

        // Also remove the review from the user's reviews list
        await User.findByIdAndUpdate(
            userId,
            { $pull: { reviews: reviewId } }, // Remove the review from the user's "reviews" array
            { new: true }
        );

        return NextResponse.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting the review:", error);
        return NextResponse.json({ error: "An error occurred while deleting the review" }, { status: 500 });
    }
}
