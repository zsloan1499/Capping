import { NextResponse } from "next/server";

// same as regular spotify search api
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

        // Enrich tracks with genre data from artists or albums
        const tracksWithGenres = await Promise.all(data.tracks.items.map(async (track) => {
            let genres = [];
            if (track.artists && track.artists.length > 0) {
                const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${track.artists[0].id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const artistData = await artistResponse.json();
                genres = artistData.genres || []; // Fetch genres from the artist data
            }
            return { ...track, genres }; // Include the genres in the track object
        }));

        return NextResponse.json({ tracks: { items: tracksWithGenres } });
    } catch (error) {
        console.error("Error searching Spotify:", error);
        return NextResponse.json({ error: "Error searching Spotify" }, { status: 500 });
    }
}
