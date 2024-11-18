// api/playlists/route.js
import { connectMongoDB } from '/lib/mongodb';
import Playlist from '/models/user'; // Assuming you have a model for playlists
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  await connectMongoDB();

  if (req.method === 'GET') {
    try {
      const playlists = await Playlist.find({ user: session.user.id }).populate('songs');
      res.status(200).json({ playlists });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch playlists' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}


