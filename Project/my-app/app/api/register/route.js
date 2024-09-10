import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../models/User"; 

export async function POST(req) {
    try {
        const { fName, lName, email, username, password } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 10);
        await connectMongoDB();
        console.log("Connected to MongoDB");
        await User.create({ fName, lName, email, username, password: hashedPassword });

        return NextResponse.json({ message: "User Registered" }, { status: 201 });
    } catch (error) {
        console.error("Error:", error); 
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}
