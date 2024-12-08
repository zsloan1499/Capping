
import { NextResponse } from "next/server";

//spotify recently played songs
export async function GET(req) {
    try {
    //get access token
    const accessToken = req.headers.get("Authorization")?.split(" ")[1]; // This retrieves the access token from the request headers sent to the backend route.
    console.log("Access Token in API:", accessToken);

    if (!accessToken) {
        return NextResponse.json({ error: "Spotify access token not found" }, { status: 401 });
    }

    //call spotify api 
    const response = await fetch("https://api.spotify.com/v1/me/player/recently-played", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: errorData.message || "Failed to fetch recently played songs" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data.items); // Only return song items
    } catch (error) {
        console.error("Error fetching recently played songs:", error);
        return NextResponse.json({ error: "Error fetching recently played songs" }, { status: 500 });
    }
}
