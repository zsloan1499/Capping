import { connectMongoDB } from '../../../lib/mongodb';
import { NextResponse } from "next/server";
import { User } from "../../../models/User"; // Adjust the path if necessary

export async function GET(req) {
    try {
        await connectMongoDB();
        const { email } = req.nextUrl.searchParams; // Extract email from query parameters

        // Check if email is provided
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Fetch user from the database using email
        const user = await User.findOne({ email }).select("profilePhoto"); // Only select profilePhoto field

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return the profile photo URL
        return NextResponse.json({ profilePhoto: user.profilePhoto }, { status: 200 });
    } catch (error) {
        console.error("Error fetching profile photo:", error);
        return NextResponse.json({ error: "An error occurred while fetching profile photo" }, { status: 500 });
    }
}
