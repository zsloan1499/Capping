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
            profilePhoto: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.vecteezy.com%2Ffree-vector%2Fdefault-profile-picture&psig=AOvVaw0T_T2Qo0Y0h-G83HyPqMuC&ust=1727825682281000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCLjlnPXq64gDFQAAAAAdAAAAABAE",  // Use provided photo or default
            likedSongs: [],   // Initialize likedSongs as an empty array
            playlists: [],    // Initialize playlists as an empty array
            reviews: [],      // Initialize reviews as an empty array
        });

        return NextResponse.json({ message: "User Registered", user: newUser }, { status: 201 });
    } catch (error) {
        console.error("Error:", error); 
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}
