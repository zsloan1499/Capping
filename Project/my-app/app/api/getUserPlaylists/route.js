import { NextResponse } from 'next/server';

//spotify api to get the user playlists, will return all the playlists the user has
export async function GET(req) {
  try {
    const accessToken = req.headers.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
      console.error('Spotify access token not found');
      return NextResponse.json({ error: 'Spotify access token not found' }, { status: 401 });
    }

    let playlists = [];
    let nextUrl = 'https://api.spotify.com/v1/me/playlists'; // Initial URL to fetch playlists

    // Loop to fetch all playlists, following pagination links
    while (nextUrl) {
      const response = await fetch(nextUrl, {
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
      playlists = playlists.concat(data.items); // Add the current page's playlists to the list

      // If there's a next page, update nextUrl
      nextUrl = data.next;
    }

    return NextResponse.json(playlists); // Return the full list of playlists
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Error fetching playlists' }, { status: 500 });
  }
}
