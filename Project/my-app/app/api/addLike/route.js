import { connectMongoDB } from "/lib/mongodb";
import { Review } from "/models/User";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectMongoDB();

    //take the review and userid
    const { reviewId, userId } = await req.json();
    if (!reviewId || !userId) {
      return NextResponse.json({ error: "Review ID and User ID are required" }, { status: 400 });
    }

    //idk why it is crossed out?
    const userObjectId = new mongoose.Types.ObjectId(userId);
    //find the review to like
    const review = await Review.findById(reviewId).populate("likes", "_id");

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Ensure the review likes is always an array of user objects
    review.likes = review.likes || [];

    // Check if the user has already liked the review
    const userHasLiked = review.likes.some((like) => like.equals(userObjectId));

    if (userHasLiked) {
      // if the user has already liked, remove the like
      review.likes = review.likes.filter((like) => !like.equals(userObjectId));
      await review.save();
      return NextResponse.json({
        message: "Review unliked successfully",
        likesCount: review.likes.length,
      });
    } else {
      // If the user hasn't liked, add the like
      review.likes.push(userObjectId);
      await review.save();
      return NextResponse.json({
        message: "Review liked successfully",
        likesCount: review.likes.length,
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "An error occurred while toggling the like" }, { status: 500 });
  }
}
