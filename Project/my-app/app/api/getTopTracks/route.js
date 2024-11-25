import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(req, authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Spotify access token not found" }, { status: 401 });
  }

  try {
    const response = await fetch("https://api.spotify.com/v1/playlists/37i9dQZEVXbLRQDuF5jeBp/tracks", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || "Failed to fetch top tracks" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.items);
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    return NextResponse.json({ error: "Error fetching top tracks" }, { status: 500 });
  }
}


