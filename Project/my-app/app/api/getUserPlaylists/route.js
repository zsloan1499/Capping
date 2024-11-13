// app/api/getUserPlaylists/route.js
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const accessToken = req.headers.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
      console.error('Spotify access token not found');
      return NextResponse.json({ error: 'Spotify access token not found' }, { status: 401 });
    }

    // Call Spotify API to get user's playlists
    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=9', {
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
          { error: errorText || 'Failed to fetch playlists' },
          { status: response.status }
        );
      }
      console.error('Error from Spotify API:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to fetch playlists' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.items); // Return the array of playlist items
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Error fetching playlists' }, { status: 500 });
  }
}
