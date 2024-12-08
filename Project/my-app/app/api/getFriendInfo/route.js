import { connectMongoDB } from "../../../lib/mongodb";
import { User, Review } from "../../../models/User"; 
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Connect to mongo
        await connectMongoDB();

        const { username } = await req.json();  //  username from the request 

        // valid username
        if (!username) {
            return NextResponse.json({ error: "A valid username is required" }, { status: 400 });
        }

        // Find user by username, and select relevant fields
        const user = await User.findOne({ username }).select("username profilePhoto followers following");

        // Check if user exists
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Calculate follower and following counts if followers and following are arrays
        const followerCount = user.followers ? user.followers.length : 0;
        const followingCount = user.following ? user.following.length : 0;

        // Fetch reviews by the user's userId and only return review IDs
        const reviews = await Review.find({ userId: user._id }).select('_id');

        // Respond with user's profile information, counts, and review IDs
        return NextResponse.json({
            username: user.username,
            profilePhoto: user.profilePhoto,
            followerCount,
            followingCount,
            reviewIds: reviews.map(review => review._id) // Include review IDs
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        return NextResponse.json({ error: "An error occurred while fetching user data" }, { status: 500 });
    }
}
