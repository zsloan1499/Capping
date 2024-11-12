// pages/api/getUsername.js
import { connectMongoDB } from "../../../lib/mongodb"; 
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectMongoDB(); // Make sure to connect to the DB
        const { userId } = await req.json(); // Expecting userId in the request body

        // Fetch the user from the database by userId
        const user = await User.findById(userId).select('username'); // Only select the username field

        if (user) {
            return new NextResponse(JSON.stringify({ username: user.username }), { status: 200 });
        } else {
            return new NextResponse(JSON.stringify({ username: null }), { status: 404 });
        }
    } catch (error) {
        console.log(error);
        return new NextResponse(JSON.stringify({ error: "Failed to fetch username" }), { status: 500 });
    }
}
