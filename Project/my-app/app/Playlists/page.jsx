// app/Playlists/page.jsx

'use client';  // This marks the component as a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';  // Use next/navigation instead of next/router
import { useSession } from 'next-auth/react';  // Assuming you're using next-auth for user authentication
import { Playlist, Song } from '/lib/mongodb';

const PlaylistPage = () => {
  const { data: session } = useSession();  // Get the logged-in user
  const router = useRouter();
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    if (!session) {
      router.push('/login');  // Redirect to login if the user is not authenticated
      return;
    }
    // Fetch playlists and songs when the user is authenticated
    const fetchData = async () => {
      const playlistResponse = await fetch(`/api/playlists?userId=${session.user.id}`);
      const songResponse = await fetch('/api/songs');
      const playlists = await playlistResponse.json();
      const songs = await songResponse.json();
      setPlaylists(playlists);
      setSongs(songs);
    };
    fetchData();
  }, [session, router]);

  const handleAddSongToPlaylist = async (songId) => {
    const updatedPlaylist = [...selectedPlaylist.songs, songId];
    const response = await fetch(`/api/playlists/${selectedPlaylist._id}`, {
      method: 'PUT',
      body: JSON.stringify({ songs: updatedPlaylist }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setSelectedPlaylist(data);
  };

  return (
    <div>
      <h1>Your Playlists</h1>
      <div>
        {playlists.map((playlist) => (
          <div key={playlist._id}>
            <h2>{playlist.name}</h2>
            <button onClick={() => setSelectedPlaylist(playlist)}>View Playlist</button>
          </div>
        ))}
      </div>

      {selectedPlaylist && (
        <div>
          <h2>{selectedPlaylist.name}</h2>
          <h3>Songs:</h3>
          <ul>
            {selectedPlaylist.songs.map((songId) => {
              const song = songs.find((song) => song._id === songId);
              return song ? <li key={song._id}>{song.name}</li> : null;
            })}
          </ul>

          <h3>Add Song to Playlist</h3>
          <select onChange={(e) => handleAddSongToPlaylist(e.target.value)}>
            <option>Select a song</option>
            {songs.map((song) => (
              <option key={song._id} value={song._id}>{song.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;
