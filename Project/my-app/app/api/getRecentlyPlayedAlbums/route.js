
import { NextResponse } from 'next/server';

//spotify api for the recently played albums
export async function GET(req) {
  try {
    const accessToken = req.headers.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
      console.error('Spotify access token not found');
      return NextResponse.json({ error: 'Spotify access token not found' }, { status: 401 });
    }

    // Fetch user's recently played tracks
    const response = await fetch('https://api.spotify.com/v1/me/player/recently-played', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Spotify API:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to fetch recently played albums' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter for unique albums
    const albums = [];
    const albumMap = new Map();

    data.items.forEach((item) => {
      const album = item.track.album;
      if (!albumMap.has(album.id)) {
        albumMap.set(album.id, true);
        albums.push(album);
      }
    });

    return NextResponse.json(albums.slice(0, 9)); // Return the 9 most recent unique albums
  } catch (error) {
    console.error('Error fetching recently played albums:', error);
    return NextResponse.json({ error: 'Error fetching recently played albums' }, { status: 500 });
  }
}