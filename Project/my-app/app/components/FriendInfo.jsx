'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";

export default function FriendInfo() {
    const { data: session } = useSession(); // Get session data
    const [friendInfo, setFriendInfo] = useState({ username: '', profilePhoto: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // Track loading state

    const username = new URLSearchParams(window.location.search).get('username'); // Extract username from URL params

    useEffect(() => {
        if (username) { // Check if username is available
            const fetchFriendInfo = async () => {
                try {
                    const response = await fetch('/api/getFriendInfo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username }) // Use username from the URL
                    });

                    const data = await response.json();
                    
                    if (response.ok) {
                        setFriendInfo({ username: data.username, profilePhoto: data.profilePhoto });
                    } else {
                        setError(data.error || "An error occurred");
                    }
                } catch (err) {
                    console.error("Error fetching friend info:", err);
                    setError("An unexpected error occurred.");
                } finally {
                    setLoading(false); // Set loading to false after fetch completes
                }
            };

            fetchFriendInfo(); // Call the fetch function
        }
    }, [username]); // Fetch data whenever the username changes

    return (
        <div className="flex flex-col items-center p-4 bg-customBlue h-screen text-white">
            {loading ? (
                <div className="text-red-500 mt-4">Loading...</div> // Show loading message
            ) : (
                <>
                    <h1 className="text-2xl font-bold">{friendInfo.username}</h1>
                    {friendInfo.profilePhoto ? (
                        <img src={friendInfo.profilePhoto} alt={`${friendInfo.username}'s Profile Photo`} className="w-48 h-48 rounded-full mt-4" />
                    ) : (
                        <div className="text-red-500 mt-4">{error || "Profile photo not available."}</div>
                    )}
                </>
            )}
        </div>
    );
}
