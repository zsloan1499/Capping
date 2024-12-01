import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const accessToken = req.headers.get("Authorization")?.split(" ")[1]; // Get the access token
    console.log("Access Token in API:", accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: "Spotify access token not found" }, { status: 401 });
    }

    // Call Spotify API to get recently played songs
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

    // For each song, fetch album details to get the genre
    const songsWithGenres = await Promise.all(data.items.map(async (item) => {
      const albumId = item.track.album.id;

      // Fetch the album details
      const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!albumResponse.ok) {
        const errorData = await albumResponse.json();
        throw new Error(`Failed to fetch album details: ${errorData.message}`);
      }

      const albumData = await albumResponse.json();

      // Fetch artist details to get genre as a fallback
      let genres = albumData.genres || [];  // Try fetching genres from the album
      if (!genres.length && item.track.artists.length > 0) {
        const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${item.track.artists[0].id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const artistData = await artistResponse.json();
        genres = artistData.genres || [];  // Fallback to artist genres
      }

      // Return the song with its album/artist genres
      return {
        song: item.track.name,
        artist: item.track.artists[0].name,
        album: albumData.name,
        genres, // Album genres or artist genres
      };
    }));

    return NextResponse.json(songsWithGenres);
  } catch (error) {
    console.error("Error fetching recently played songs:", error);
    return NextResponse.json({ error: "Error fetching recently played songs" }, { status: 500 });
  }
}
