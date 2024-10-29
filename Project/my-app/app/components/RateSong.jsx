'use client';
import { useState, useEffect } from "react";

export default function RateSong({ spotifyId, userId }) {
    const [rating, setRating] = useState(0); // Holds the user-selected rating
    const [message, setMessage] = useState(""); // Stores messages for the user, e.g., success or error messages
    const [songData, setSongData] = useState(null); // Stores information about the song to be rated


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

    // Fetch a song on component load
    useEffect(() => {
        const fetchSong = async () => {
            try {
                // Retrieve the access token from sessionStorage
                const accessToken = sessionStorage.getItem("spotifyAccessToken");
                console.log("Access Token in RateSong:", accessToken);
                //const accessToken = localStorage.getItem("spotifyAccessToken");// tried using local storage
                if (!accessToken) {
                    setMessage("Spotify access token not found. Please login with Spotify.");
                    return;
                }

                // Call the backend API to get song details
                const res = await fetch("/api/getSong", {
                    method: "GET",
                    headers: {
                        Authorization: accessToken,
                    },
                });

                const data = await res.json();

                if (res.ok) {
                    setSongData(data); // Store song data in state
                    setMessage("Song data fetched successfully.");
                } else {
                    setMessage(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error("Error fetching song:", error);
                setMessage("An error occurred while fetching the song. Please try again.");
            }
        };

        fetchSong();
    }, []);

    return (
        <div className="rate-song">
            <h3 className="font-bold text-lg">Rate this song</h3>
            {songData ? (
                <div>
                    <p><strong>Song:</strong> {songData.name}</p>
                    <p><strong>Artist:</strong> {songData.artists.map(artist => artist.name).join(", ")}</p>
                </div>
            ) : (
                <p>Loading song data...</p>
            )}

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

