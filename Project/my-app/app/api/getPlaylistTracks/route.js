import { NextResponse } from 'next/server';

//spotify apiu to get playlist tracks/song in the playlist
export async function POST(req) {
  try {
    const { playlistId } = await req.json(); // Get the playlistId from the request body
    const accessToken = req.headers.get('Authorization')?.split(' ')[1]; // Extract the access token

    if (!accessToken) {
      console.error('Spotify access token not found');
      return NextResponse.json({ error: 'Spotify access token not found' }, { status: 401 });
    }

    if (!playlistId) {
      console.error('Playlist ID not provided');
      return NextResponse.json({ error: 'Playlist ID not provided' }, { status: 400 });
    }

    // Call Spotify API to get the tracks for the specific playlist
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        const errorText = await response.text();
        console.error('Non-JSON error response from Spotify API:', errorText);
        return NextResponse.json(
          { error: errorText || 'Failed to fetch tracks' },
          { status: response.status }
        );
      }
      console.error('Error from Spotify API:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to fetch tracks' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.items); // Return the array of track items
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json({ error: 'Error fetching tracks' }, { status: 500 });
  }
}
