// api/playlistSongs/route.js
import { connectMongoDB } from "/lib/mongodb";
import Playlist from "/models/user";
import Song from "/models/user";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { playlistId, songId } = req.body;

  await connectMongoDB();

  if (req.method === "POST") {
    try {
      const playlist = await Playlist.findById(playlistId);
      const song = await Song.findById(songId);

      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }

      playlist.songs.push(song);  // Add the song to the playlist's songs array
      await playlist.save();  // Save the updated playlist
      res.status(200).json({ message: "Song added to playlist", playlist });
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      res.status(500).json({ error: "Failed to add song to playlist" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

  
