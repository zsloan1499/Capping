//api/playlistID/route.js
import { connectMongoDB } from '/lib/mongodb';
import Playlist from '../../models/playlist';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  await connectMongoDB();

  if (req.method === 'GET') {
    try {
      const playlist = await Playlist.findById(id).populate('songs');
      res.status(200).json({ playlist });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch playlist' });
    }
  } else if (req.method === 'POST') {
    // Add a song to the playlist
    const { songId } = req.body;
    try {
      const playlist = await Playlist.findById(id);
      playlist.songs.push(songId);
      await playlist.save();
      res.status(200).json({ message: 'Song added to playlist', playlist });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add song to playlist' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}