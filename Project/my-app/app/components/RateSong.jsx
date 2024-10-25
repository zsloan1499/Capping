'use client';
import { useState } from "react";

export default function RateSong({ spotifyId, userId }) {
    const [rating, setRating] = useState(0); // Holds the user-selected rating
    const [message, setMessage] = useState(""); // Stores messages for the user, e.g., success or error messages

    // Function to handle rating submission
    const handleRatingSubmit = async () => {
        if (rating < 1 || rating > 10) {
            setMessage("Please select a rating between 1 and 10.");
            return;
        }

        try {
            // Send the rating to the backend
            const res = await fetch("/api/rateSong", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, spotifyId, rating }) // need to make sure songId is a valid ObjectId
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`Rating submitted successfully. Average rating is now ${data.averageRating.toFixed(1)}`);
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            setMessage("An error occurred while submitting your rating. Please try again.");
        }
    };

    return (
        <div className="rate-song">
            <h3 className="font-bold text-lg">Rate this song</h3>
            <label htmlFor="rating">Rating (1-10): </label>
            <input
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="border border-gray-300 rounded p-2 mx-2"
            />
            <button
                onClick={handleRatingSubmit}
                className="bg-green-500 text-white p-2 rounded"
            >
                Submit Rating
            </button>
            {message && <p className="mt-2 text-gray-700">{message}</p>}
        </div>
    );
}
