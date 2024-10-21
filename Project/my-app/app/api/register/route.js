import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "../../../lib/mongodb";
import { User, Song, Review, Playlist } from "../../../models/User"; 


export async function POST(req) {
    try {
        const { fName, lName, email, username, password } = await req.json();
        
        // encrpyt password
        const hashedPassword = await bcrypt.hash(password, 10);


        await connectMongoDB();
        console.log("Connected to MongoDB");

        // Create a new user with empty likedSongs, playlists, and reviews arrays
        const newUser = await User.create({
            fName,
            lName,
            email,
            username,
            password: hashedPassword,
            profilePhoto: "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png",  // Use provided photo or default
            likedSongs: [],   // Initialize likedSongs as an empty array
            playlists: [],    // Initialize playlists as an empty array
            reviews: [],      // Initialize reviews as an empty array
            following: [],    // empty array of followers
            followers: [],    // empty array of 
        });

        return NextResponse.json({ message: "User Registered", user: newUser }, { status: 201 });
    } catch (error) {
        console.error("Error:", error); 
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}
