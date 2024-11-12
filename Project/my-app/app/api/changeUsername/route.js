import { connectMongoDB } from "../../../lib/mongodb";
import { NextResponse } from "next/server";
import { User } from "../../../models/User"; 

export async function POST(req) {
    try {
        await connectMongoDB();
        const { username, userId } = await req.json(); // Expecting userId in the request body

        // Check if the username exists
        const existingUsername = await User.findOne({ username }).select("_id");

        if (existingUsername) {
            return NextResponse.json({ usernameExists: true });
        }

        // Update the username in the database using userId
        const result = await User.updateOne({ _id: userId }, { $set: { username } });

        if (result.modifiedCount > 0) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Username change failed." });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "An error occurred during the username change." });
    }
}
