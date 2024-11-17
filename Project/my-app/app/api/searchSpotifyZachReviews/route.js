import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { query } = await req.json();
        const accessToken = req.headers.get("Authorization")?.split(" ")[1];

        if (!accessToken) {
            return NextResponse.json({ error: "Spotify access token not found" }, { status: 401 });
        }

        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=10`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: errorData.message || "Failed to fetch search results" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error searching Spotify:", error);
        return NextResponse.json({ error: "Error searching Spotify" }, { status: 500 });
    }
}
