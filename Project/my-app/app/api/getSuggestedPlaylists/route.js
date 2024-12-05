import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { genres } = await req.json();
    const accessToken = req.headers.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return NextResponse.json({ error: 'Spotify access token not found' }, { status: 401 });
    }

    let suggestedPlaylists = [];
    for (let genre of genres) {
      const response = await fetch(`https://api.spotify.com/v1/search?q=genre:"${genre}"&type=playlist&limit=25`, {  // Adjust query format for genre
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error fetching playlists for genre ${genre}:`, errorData);
        return NextResponse.json({ error: errorData.error.message }, { status: 400 });
      }

      const data = await response.json();
      console.log(`Playlists for genre ${genre}:`, data);  // Debugging: Log the fetched data

      suggestedPlaylists = [...suggestedPlaylists, ...data.playlists.items];
    }

    // Return up to a maximum of 25 playlists total
    return NextResponse.json(suggestedPlaylists.slice(0, 25));  // Ensure only 25 playlists are returned
  } catch (error) {
    console.error('Error fetching suggested playlists:', error);
    return NextResponse.json({ error: 'Error fetching suggested playlists' }, { status: 500 });
  }
}
