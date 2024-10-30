// api/getRecentlyPlayedSongs/route.js
import { NextResponse } from "next/server";

export async function GET() {
    try {
    //get access token
    //const accessToken = sessionStorage.getItem("spotifyAccessToken"); 
    const accessToken = req.headers.get("Authorization")?.split(" ")[1]; // This retrieves the access token from the request headers sent to the backend route.
    console.log("Access Token in API:", accessToken);

    if (!accessToken) {
        return NextResponse.json({ error: "Spotify access token not found" }, { status: 401 });
    }

    
    const response = await fetch("https://api.spotify.com/v1/me/player/recently-played", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            },
        });

        // Check and log the raw response body
        const responseText = await response.text();
        console.log("Raw response text:", responseText);

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json({ error: error.message || "Failed to fetch recently played songs" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data.items); // Only return song items
    } catch (error) {
        console.error("Error fetching recently played songs:", error);
        return NextResponse.json({ error: "Error fetching recently played songs" }, { status: 500 });
    }
}
