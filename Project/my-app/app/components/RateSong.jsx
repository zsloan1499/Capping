'use client';
import { useState, useEffect } from "react";

export default function RateSong({ spotifyId, userId }) {
    const [rating, setRating] = useState(0); // Holds the user-selected rating
    const [message, setMessage] = useState(""); // Stores messages for the user, e.g., success or error messages
    const [songData, setSongData] = useState(null); // Stores information about the song to be rated
    const [topSongs, setTopSongs] = useState([]);//top songs
    const [songs, setSongs] = useState([]);//recently listened songs 
    const [recentlyPlayed, setRecentlyPlayed] = useState([]); // Stores recently played songs


    //Function to handle rating submission
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
                setMessage("Rating submitted successfully");
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            setMessage("An error occurred while submitting your rating. Please try again.");
        }
    };

    //Fetching recently played songs 
    useEffect(() => {
        const fetchRecentlyPlayed = async () => {
            try {
                // Get access token from local storage or session storage
                const accessToken = sessionStorage.getItem("spotifyAccessToken");

                if (!accessToken) {
                    setMessage("Spotify access token not found. Please login with Spotify.");
                    return;
                }

                // Call backend API
                const response = await fetch("/api/getRecentlyPlayedSongs", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    //setRecentlyPlayed(data); // Set fetched songs
                    setRecentlyPlayed(data.items || []); // Set recently played songs
                } else {
                    setMessage("Failed to fetch recently played songs");
                }
            } catch (error) {
                console.error("Error fetching recently played songs:", error);
                setMessage("An error occurred while fetching recently played songs.");
            }
        };

        fetchRecentlyPlayed();
    }, []);

    //Fetching a single song, currently hardcoded in getSong/route.js 
    useEffect(() => {
        const fetchSong = async () => {
            try {
                // Retrieve the access token from sessionStorage
                const accessToken = sessionStorage.getItem("spotifyAccessToken");
                //console.log("Access Token in RateSong:", accessToken);
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

    //display a single song 
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

            {/* Additional Section */}
        <h3 className="font-bold text-lg mt-6">Recently Played Songs</h3>
        {recentlyPlayed.length > 0 ? (
            <ul>
                {recentlyPlayed.map((track, index) => (
                    <li key={index} className="my-2">
                        <p><strong>Song:</strong> {track.name}</p>
                        <p><strong>Artist:</strong> {track.artists.map(artist => artist.name).join(", ")}</p>
                    </li>
                ))}
            </ul>
        ) : (
            <p>Loading recently played songs...</p>
        )}
        </div>
    );
    
     //display recently played songs 
/*     return (
        <div>
            <h2>Recently Played Songs</h2>
            {message && <p>{message}</p>}
            <ul>
                {songs.map((item, index) => (
                    <li key={index}>
                        <p><strong>{item.track.name}</strong> by {item.track.artists.map(artist => artist.name).join(", ")}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
*/

/*
    //display users top songs
    return (
        <div className="rate-song">
            <h3 className="font-bold text-lg">Your Top Songs</h3>
            {topSongs.length > 0 ? (
                topSongs.map((song, index) => (
                    <div key={index} className="song">
                        <p>Song Name: {song.name}</p>
                        <p>Artist: {song.artists?.[0]?.name}</p>
                    </div>
                ))
            ) : (
                <p>No top songs found.</p>
            )}
            {message && <p className="mt-2 text-gray-700">{message}</p>}
        </div>
    );
}
*/
}



