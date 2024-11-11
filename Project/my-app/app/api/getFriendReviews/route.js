import { connectMongoDB } from "../../../lib/mongodb";
import { User, Review, Song } from "/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    await connectMongoDB();
    const { userId } = await req.json();

    try {
        const reviews = await Review.find({ userId }); // Find reviews for this user
        return NextResponse.json({ reviews });
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}
