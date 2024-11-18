// api/songs/route.js
import { connectMongoDB } from '/lib/mongodb';
import Song from '/models/user';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  await connectMongoDB();

  if (req.method === 'GET') {
    try {
      const songs = await Song.find(); // Fetch all songs from the Song model
      res.status(200).json(songs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch songs' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
