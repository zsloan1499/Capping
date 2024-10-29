import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        // Retrieve the access token from the client’s session storage
        const accessToken = req.headers.get("authorization");

        // For this test, specify a hardcoded Spotify song ID (change as needed)
        const spotifySongId = "3n3Ppam7vgaVa1iaRUc9Lp"; // Example song ID (Ed Sheeran - Shape of You)

        // Call Spotify API to get the song details
        const response = await fetch(`https://api.spotify.com/v1/tracks/${spotifySongId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // Check for a successful response
        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: errorData.error.message }, { status: response.status });
        }

        // Parse and return the song data
        const songData = await response.json();
        return NextResponse.json(songData);
    } catch (error) {
        console.error("Error fetching song:", error);
        return NextResponse.json({ error: "Error fetching song" }, { status: 500 });
    }
}
