//app/components/playlistPage.jsx
'use client';
import { BellIcon, CogIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { Playlist, Song } from '/models/user';
import "react-multi-carousel/lib/styles.css";

export default function PlaylistsPage() {
  const { data: session } = useSession();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  // Toggle sidebar navigation visibility
  const toggleNav = () => setIsNavOpen(!isNavOpen);

  // Fetch playlists and songs from API
  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          const playlistResponse = await fetch(`/api/playlists?userId=${session.user.id}`);
          const songResponse = await fetch('/api/songs');
          
          if (!playlistResponse.ok || !songResponse.ok) {
            console.error("Failed to fetch data");
            return;
          }

          const playlists = await playlistResponse.json();
          const songs = await songResponse.json();

          setPlaylists(playlists);
          setSongs(songs);
        } catch (error) {
          console.error("Error fetching playlists or songs:", error);
        }
      };

      fetchData();
    }
  }, [session]);

  // Handle selecting a playlist and adding a song
  const handleAddSongToPlaylist = async (playlistId, songId) => {
    try {
      const response = await fetch('/api/playlistSongs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlistId, songId }),
      });

      const data = await response.json();
      if (data.error) {
        console.error(data.error);
      } else {
        console.log('Song added to playlist');
      }
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    }
  };

  return (
    <div className="bg-customBlue w-screen h-screen flex overflow-x-hidden">
      {/* Sidebar Navigation */}
      <nav className={`bg-black ${isNavOpen ? 'w-42' : 'w-12'} h-full p-4 flex flex-col space-y-4 transition-width duration-300`}>
        <button className="bg-blue-500 text-white p-2 rounded mb-4 w-16" onClick={toggleNav}>
          {isNavOpen ? 'Close' : 'Open'}
        </button>

        {isNavOpen && (
          <>
            <Link href="/" className="text-white p-2 hover:bg-gray-700 rounded">Homepage</Link>
            <Link href="/playlists" className="text-white p-2 hover:bg-gray-700 rounded">Playlists</Link>
            <Link href="/rate-song" className="text-white p-2 hover:bg-gray-700 rounded">Reviews</Link>
            {/* Other links */}
          </>
        )}
      </nav>

      {/* Main Content Area */}
      <div className={`flex-grow p-8 ${isNavOpen ? 'ml-32' : 'ml-12'}`}>
        <title>Melodi - Your Playlists</title>
        <div className="flex items-center justify-between">
          <h1 className="text-white text-3xl font-bold">Your Playlists</h1>
          <div className="flex items-center space-x-4">
            <Link href="/UserInfo">
              <img
                src={session?.user?.profilePhoto || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
                alt="User Profile Photo"
                className="w-6 h-6"
              />
            </Link>
            <button className="text-white relative">
              <BellIcon className="w-6 h-6" />
            </button>
            <button className="text-white">
              <CogIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-white text-2xl">Your Playlists</h2>
          <div className="mt-4">
            {playlists.length === 0 ? (
              <p className="text-white">You don't have any playlists yet.</p>
            ) : (
              <ul className="text-white">
                {playlists.map((playlist) => (
                  <li key={playlist._id} className="mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{playlist.name}</span>
                      <button
                        onClick={() => setSelectedPlaylist(playlist)}
                        className="bg-blue-500 text-white p-2 rounded"
                      >
                        Add Song
                      </button>
                    </div>

                    {/* If a playlist is selected, display the available songs to add */}
                    {selectedPlaylist && selectedPlaylist._id === playlist._id && (
                      <div className="mt-2">
                        <h3 className="text-white">Add Songs</h3>
                        <ul>
                          {songs.map((song) => (
                            <li key={song._id} className="mt-2 flex justify-between items-center">
                              <span>{song.name} - {song.artist}</span>
                              <button
                                onClick={() => handleAddSongToPlaylist(playlist._id, song._id)}
                                className="bg-green-500 text-white p-2 rounded"
                              >
                                Add to Playlist
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
