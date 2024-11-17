'use client';
import { BellIcon, CogIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";

export default function PlaylistsPage() {
  const { data: session } = useSession();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistsMessage, setPlaylistsMessage] = useState('');

  const carouselContainerStyle = {
    width: '80vw',
    overflow: 'hidden',
    margin: '0 auto',
  };

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  // Fetch playlists and songs from API
  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          // Fetch playlists
          const playlistResponse = await fetch(`/api/playlists`);
          if (playlistResponse.ok) {
            const playlistsData = await playlistResponse.json();
            setPlaylists(playlistsData.playlists);
          }

          // Fetch songs
          const songResponse = await fetch('/api/songs');
          if (songResponse.ok) {
            const songsData = await songResponse.json();
            setSongs(songsData);
          }
        } catch (error) {
          console.error("Error fetching playlists or songs:", error);
          setPlaylistsMessage("Error fetching playlists.");
        }
      };

      fetchData();
    }
  }, [session]); // Run when session changes

  // Handle adding song to playlist
  const handleAddSongToPlaylist = async () => {
    if (!selectedSong || !selectedPlaylist) {
      console.error("Please select both a song and a playlist.");
      return;
    }

    try {
      const response = await fetch('/api/playlistSongs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId: selectedPlaylist,
          songId: selectedSong,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error(data.error);
      } else {
        console.log('Song added to playlist');
        // Optionally, update the UI here to reflect the changes
        setSelectedSong(null);
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    }
  };

  const responsive = {
    superLarge: {
      breakpoint: { max: 4000, min: 1024 },
      items: 5,
    },
    large: {
      breakpoint: { max: 1024, min: 768 },
      items: 4,
    },
    medium: {
      breakpoint: { max: 768, min: 480 },
      items: 3,
    },
    small: {
      breakpoint: { max: 480, min: 0 },
      items: 2,
    },
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
          
          {/* Carousel Section - Your Playlists */}
          <div style={carouselContainerStyle} className="w-full mt-8">
            {playlistsMessage && <p className="text-red-500">{playlistsMessage}</p>}

            {playlists.length > 0 ? (
              <Carousel responsive={responsive} arrows={true}>
                {playlists.map((playlist, index) => {
                  const playlistImageUrl =
                    playlist.images && playlist.images.length > 0 ? playlist.images[0].url : null;

                  return (
                    <div
                      key={index}
                      className="carousel-item flex flex-col items-center p-2"
                      style={{
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        minHeight: '220px',
                      }}
                    >
                      {playlistImageUrl && (
                        <img
                          src={playlistImageUrl}
                          alt={`Cover art for ${playlist.name}`}
                          style={{
                            width: '10rem',
                            height: '10rem',
                            objectFit: 'cover',
                            marginBottom: '0.5rem',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                      <div className="flex flex-col items-center">
                        <p
                          style={{
                            color: 'black',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            margin: 0,
                          }}
                        >
                          {playlist.name}
                        </p>
                        <p
                          style={{
                            color: 'black',
                            textAlign: 'center',
                            margin: 0,
                          }}
                        >
                          {playlist.tracks.total} songs
                        </p>
                      </div>
                    </div>
                  );
                })}
              </Carousel>
            ) : (
              <p className="text-white">Loading your playlists...</p>
            )}
          </div>

          {/* Add song to playlist */}
          <div className="mt-8">
            <h3 className="text-white text-xl">Add Song to Playlist</h3>
            <select
              onChange={(e) => setSelectedPlaylist(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded"
            >
              <option value="">Select Playlist</option>
              {playlists.map((playlist) => (
                <option key={playlist._id} value={playlist._id}>
                  {playlist.name}
                </option>
              ))}
            </select>

            <select
              onChange={(e) => setSelectedSong(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded ml-4"
            >
              <option value="">Select Song</option>
              {songs.map((song) => (
                <option key={song._id} value={song._id}>
                  {song.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddSongToPlaylist}
              className="bg-blue-500 text-white p-2 rounded ml-4"
            >
              Add Song
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
