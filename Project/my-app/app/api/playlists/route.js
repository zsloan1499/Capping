// api/playlists/route.js
import { connectMongoDB } from '/lib/mongodb';
import Playlist from '/models/user';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  await connectMongoDB();

  if (req.method === 'GET') {
    try {
      // Fetch playlists for the logged-in user
      const playlists = await Playlist.find({ user: session.user.id }).populate('songs');
      console.log("Playlists for user:", playlists); // Debugging log
      res.status(200).json({ playlists });
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ error: 'Failed to fetch playlists' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}



