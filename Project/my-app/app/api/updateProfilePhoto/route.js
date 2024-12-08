import { connectMongoDB } from "../../../lib/mongodb"; 
import { NextResponse } from "next/server";
import { User } from "../../../models/User"; 

//change the url in the database and then it updates itself again
export async function POST(req) {
    try {
        await connectMongoDB(); // Connect to MongoDB

        const { userId, profilePhotoUrl } = await req.json(); // Extract userId and profilePhotoUrl from the request body

        // Check if userId and profilePhotoUrl are provided
        if (!userId || !profilePhotoUrl) {
            return NextResponse.json({ error: "User ID and profile photo URL are required." }, { status: 400 });
        }

        // Update the user document in MongoDB
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePhoto: profilePhotoUrl }, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        // Successfully updated user profile photo
        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating profile photo in MongoDB: ", error);
        return NextResponse.json({ error: "Error updating profile photo." }, { status: 500 });
    }
}
