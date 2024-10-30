import { NextResponse } from "next/server";

export async function GET() {
    const spotifyAccessToken = sessionStorage.getItem("spotifyAccessToken");

    if (!spotifyAccessToken) {
        return NextResponse.json({ error: "Spotify access token not found." }, { status: 401 });
    }

    try {
        const response = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=5", {
            headers: {
                Authorization: `Bearer ${spotifyAccessToken}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch top songs from Spotify.");
        }

        const data = await response.json();
        return NextResponse.json(data.items); // Array of top tracks
    } catch (error) {
        console.error("Error fetching top songs:", error);
        return NextResponse.json({ error: "Error fetching top songs" }, { status: 500 });
    }
}
