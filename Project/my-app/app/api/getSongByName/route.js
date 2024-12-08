import { connectMongoDB } from '/lib/mongodb';
import { Song } from '/models/User'; 
import { NextResponse } from 'next/server';

//gets a song by its name(not used anymore, i dont think)
export async function POST(req) {
  try {
    await connectMongoDB();

    const { songName } = await req.json();

    if (!songName) {
      return NextResponse.json({ error: "A valid song name is required" }, { status: 400 });
    }

    const song = await Song.findOne({ name: songName }).select('_id'); // Search for the song by name

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    return NextResponse.json({ songId: song._id });
  } catch (error) {
    console.error("Error fetching song by name:", error);
    return NextResponse.json({ error: "An error occurred while fetching the song" }, { status: 500 });
  }
}
