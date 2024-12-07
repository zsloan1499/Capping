//
import { connectMongoDB } from "/lib/mongodb";
import mongoose, { Schema, models } from "mongoose";

// Schema for a song
const songSchema = new Schema({
    spotifyId: {
        type: String, // Store Spotify's song ID directly
        required: false,
        unique: true, // Unique ID for each song
    },
    name: {
        type: String,
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    customImage: {
        type: String, // URL for the custom image
        required: false, // Optional custom image
    },
    genres: [{
        type: String,
      }],
}, { timestamps: true });

const Song = models.Song || mongoose.model("Song", songSchema);

// Schema for a review
const reviewSchema = new Schema({
    song: {
        type: Schema.Types.ObjectId, // Reference to the song document
        ref: "Song",
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId, // Reference to the User who wrote the review
        ref: "User",
        required: true,
    },
    reviewText: {
        type: String,
        required: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [] // Ensure it defaults to an empty array
    }],
    
    rating: {
        type: Number,
        default: 0,
        required: true,
    },
    comments: [{
        user: {
            type: Schema.Types.ObjectId, // Reference to the user who commented
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    }],
    ratings: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User", // Reference to the user who gave the rating
                required: true,
            },
            rating: {
                type: Number,
                min: 1,
                max: 10,
                required: true,
            }
        }
    ],
}, { timestamps: true });

const Review = models.Review || mongoose.model("Review", reviewSchema);

// Schema for a playlist
const playlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, // Reference to the user who owns the playlist
        ref: "User",
        required: true,
    },
    name: {
        type: String, // Playlist name
        required: true,
    },
    songs: [{
        type: Schema.Types.ObjectId, // Reference to songs
        ref: "Song",
        required: true,
    }],
}, { timestamps: true });

const Playlist = models.Playlist || mongoose.model("Playlist", playlistSchema);

// User schema
const userSchema = new Schema({
    fName: {
        type: String,
        required: true,
    },
    lName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    otp: {
        type: String,
        required: false,
    },
    otpExpires: {
        type: Date,
        required: false,
    },
    profilePhoto: {
        type: String,
        required: true,
        default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.vecteezy.com%2Ffree-vector%2Fdefault-profile-picture&psig=AOvVaw0T_T2Qo0Y0h-G83HyPqMuC&ust=1727825682281000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCLjlnPXq64gDFQAAAAAdAAAAABAE",
    },
    likedSongs: [{
        type: Schema.Types.ObjectId,
        ref: "Song", // Referencing liked songs
        required: false,
    }],
    playlists: [{
        type: Schema.Types.ObjectId,
        ref: "Playlist", // Referencing user's playlists
        required: false,
    }],
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review", // Referencing user's reviews
        required: false,
    }],
    rating: {
        type: String,
        required: false,
    },
    following: [{
        type: Schema.Types.ObjectId, // Changed to ObjectId
        ref: "User", // Referencing other users
        required: false,
    }],
    followers: [{
        type: Schema.Types.ObjectId, // Changed to ObjectId
        ref: "User", // Referencing other users
        required: false,
    }],

}, { timestamps: true });

const User = models.User || mongoose.model("User", userSchema);

// Export each model individually
export { User, Song, Review, Playlist };