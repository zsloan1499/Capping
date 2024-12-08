// app/api/getRecentlyPlayedArtists/route.js
import { NextResponse } from 'next/server';

//get the recently played artisits for spotify api
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
        { error: errorData.error?.message || 'Failed to fetch recently played artists' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract unique artist IDs
    const artistIds = new Set();
    data.items.forEach((item) => {
      item.track.artists.forEach((artist) => {
        artistIds.add(artist.id);
      });
    });

    // Convert Set to Array and limit to 9 artists
    const artistIdArray = Array.from(artistIds).slice(0, 9);

    // Fetch detailed artist information including images
    const artistsResponse = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIdArray.join(',')}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!artistsResponse.ok) {
      const errorData = await artistsResponse.json();
      console.error('Error from Spotify API when fetching artist details:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to fetch artist details' },
        { status: artistsResponse.status }
      );
    }

    const artistsData = await artistsResponse.json();
    return NextResponse.json(artistsData.artists); // Return full artist details including images
  } catch (error) {
    console.error('Error fetching recently played artists:', error);
    return NextResponse.json({ error: 'Error fetching recently played artists' }, { status: 500 });
  }
}