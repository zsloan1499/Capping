import { connectMongoDB } from "../../../lib/mongodb";
import { NextResponse } from "next/server";
import { User } from "../../../models/User"; 

//grab the url for the profile photo
export async function POST(req) {
    try {
        await connectMongoDB();
        const { userId } = await req.json(); // Expecting userId in the request body

        // Fetch the user's profile photo URL from the database
        const user = await User.findById(userId).select("profilePhoto");

        if (user && user.profilePhoto) {
            return NextResponse.json({ profilePhoto: user.profilePhoto });
        } else {
            return NextResponse.json({ profilePhoto: null }); // No profile photo found
        }
    } catch (error) {
        console.log("Error fetching profile photo:", error);
        return NextResponse.json({ error: "An error occurred during the profile photo fetch." });
    }
}
