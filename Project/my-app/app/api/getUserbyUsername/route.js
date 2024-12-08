import { connectMongoDB } from "../../../lib/mongodb";
import { User } from "../../../models/User";
import { NextResponse } from "next/server";

//find user by username
export async function POST(req) {
    await connectMongoDB();
    //username from request
    const { username } = await req.json();

    try {
        //find user id
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user by username:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}
