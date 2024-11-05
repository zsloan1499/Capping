import { NextResponse } from "next/server";

// Function to get an access token from session storage
function getAccessToken() {
    const accessToken = sessionStorage.getItem('spotifyAccessToken');
    if (!accessToken) {
        throw new Error('Access token not found in session storage. Please authenticate.');
    }
    return accessToken;
}

// Function to search for items on Spotify
export async function searchSpotify(query, type = 'track') {
    try {
        const accessToken = getAccessToken();
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // Check for a successful response
        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: errorData.error.message }, { status: response.status });
        }

        // Parse and return the search results
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching search results:', error);
        return NextResponse.json({ error: 'Error fetching search results' }, { status: 500 });
    }
}

// Example usage (can be used as a function call in an appropriate server route)
// searchSpotify('Imagine Dragons');
