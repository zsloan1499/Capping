import { NextResponse } from 'next/server';

//uses the get recently played reviewd of getting the genres of recently played songs and then search the reviews with songs that fit that genre
export async function POST(req) {
  try {
    const { genres } = await req.json();
    const accessToken = req.headers.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return NextResponse.json({ error: 'Spotify access token not found' }, { status: 401 });
    }

    let suggestedPlaylists = [];
    const genreRequests = genres.map(async (genre) => {
      try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=genre:"${genre}"&type=playlist&limit=1`, { // Fetch fewer playlists per genre
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error fetching playlists for genre ${genre}:`, errorData);
          throw new Error(errorData.error.message);
        }

        const data = await response.json();
        return data.playlists.items.filter(playlist => playlist.tracks.total < 100); // Filter playlists with < 100 tracks
      } catch (error) {
        console.error(`Error from Spotify API for genre ${genre}:`, error.message);
        return [];
      }
    });

    // Wait for all genre requests to complete
    const genrePlaylists = await Promise.all(genreRequests);

    // Combine playlists from all genres
    suggestedPlaylists = genrePlaylists.flat();

    // Return up to 5 playlists
    const limitedPlaylists = suggestedPlaylists.slice(0, 5);

    return NextResponse.json(limitedPlaylists);
  } catch (error) {
    console.error('Error fetching suggested playlists:', error);
    return NextResponse.json({ error: 'Error fetching suggested playlists' }, { status: 500 });
  }
}
