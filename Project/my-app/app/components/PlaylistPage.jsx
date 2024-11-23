'use client';

import Head from 'next/head'; // Import Head from next/head
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react'; // Import session handling
import Link from 'next/link';
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";
import { BellIcon, CogIcon } from '@heroicons/react/24/solid';

export default function SpotifyPlaylists() {
  const { data: session } = useSession(); // Access the user session
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [playlistsMessage, setPlaylistsMessage] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [player, setPlayer] = useState(null);  // Spotify player instance
  const [isPlaying, setIsPlaying] = useState(false); // Playback state

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      try {
        const accessToken = sessionStorage.getItem('spotifyAccessToken');
        if (!accessToken) {
          setPlaylistsMessage('Please log in with Spotify to view your playlists.');
          return;
        }

        const response = await fetch('/api/getUserPlaylists', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setPlaylists(data);
        } else {
          const errorData = await response.json();
          setPlaylistsMessage(`Failed to fetch playlists: ${errorData.error}`);
        }
      } catch (error) {
        setPlaylistsMessage('An error occurred while fetching playlists.');
      }
    };

    fetchUserPlaylists();
  }, [session]);

  const fetchPlaylistTracks = async (playlistId) => {
    try {
      const accessToken = sessionStorage.getItem('spotifyAccessToken');
      if (!accessToken) {
        setPlaylistsMessage('Please log in with Spotify to view tracks.');
        return;
      }

      const response = await fetch('/api/getPlaylistTracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ playlistId }),
      });

      const result = await response.json();

      if (response.ok) {
        setPlaylistTracks(result);
        setSelectedPlaylist(playlistId);
      } else {
        setPlaylistsMessage(`Failed to fetch tracks: ${result.error}`);
      }
    } catch (error) {
      setPlaylistsMessage('An error occurred while fetching tracks.');
    }
  };

  const playTrack = (trackUri) => {
    if (player) {
      player.play({
        uris: [trackUri],
      });
      setIsPlaying(true);
    }
  };

  const responsive = {
    superLarge: { breakpoint: { max: 4000, min: 1024 }, items: 5 },
    large: { breakpoint: { max: 1024, min: 768 }, items: 4 },
    medium: { breakpoint: { max: 768, min: 480 }, items: 3 },
    small: { breakpoint: { max: 480, min: 0 }, items: 2 },
  };

  useEffect(() => {
    if (window.Spotify) {
      const accessToken = sessionStorage.getItem('spotifyAccessToken');
      if (!accessToken) {
        console.error("No Spotify Access Token found");
        return;
      }

      const newPlayer = new window.Spotify.Player({
        name: 'Melodi Player',
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.5,
      });

      newPlayer.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player ready with device ID', device_id);
      });

      newPlayer.addListener('player_state_changed', (state) => {
        if (state && state.paused) {
          setIsPlaying(false);
        } else if (state) {
          setIsPlaying(true);
        }
      });

      newPlayer.addListener('not_ready', ({ device_id }) => {
        console.error('Device not ready: ', device_id);
      });

      newPlayer.connect();

      setPlayer(newPlayer);
    }
  }, []);

  return (
    <div className="bg-customBlue w-screen h-screen flex flex-col">
      {/* Add the SDK script */}
      <Head>
        <script type="text/javascript" src="https://sdk.scdn.co/spotify-player.js"></script>
      </Head>

      {/* Main Header */}
      <div className="p-4 bg-black text-white flex items-center justify-between shadow-md z-50">
        <h1 className="text-3xl font-bold">Melodi</h1>
        <div className="flex items-center space-x-4">
          {/* Profile Photo */}
          {session?.user ? (
            <Link href="/UserInfo">
              <img
                src={session.user.profilePhoto || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
                alt="User Profile Photo"
                className="w-10 h-10 rounded-full"
              />
            </Link>
          ) : (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => signIn('spotify')}
            >
              Sign In
            </button>
          )}
          {/* Notification Bell Icon */}
          <button className="text-white relative">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
          {/* Settings Icon */}
          <button className="text-white">
            <CogIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className={`bg-black ${isNavOpen ? 'w-42' : 'w-42'} sticky top-0 h-full p-4 flex flex-col space-y-4 transition-width duration-300`}>
          <button
            className="bg-blue-500 text-white p-2 rounded mb-4 w-16"
            onClick={toggleNav}
          >
            {isNavOpen ? 'Close' : 'Open'}
          </button>
          {isNavOpen && (
            <>
              <Link href="/" className="text-white p-2 hover:bg-gray-700 rounded">Home</Link>
              <Link href="/Playlists" className="text-white p-2 hover:bg-gray-700 rounded">Playlists</Link>
              <Link href="/Review" className="text-white p-2 hover:bg-gray-700 rounded">Reviews</Link>
              <Link href="/Social" className="text-white p-2 hover:bg-gray-700 rounded">Social</Link>
              <Link href="/Activity" className="text-white p-2 hover:bg-gray-700 rounded">Activity</Link>
              <Link href="/placeholder3" className="text-white p-2 hover:bg-gray-700 rounded">Global Ranking</Link>
            </>
          )}
        </nav>

        {/* Main Content */}
        <div className={`flex-grow p-8 ${isNavOpen ? 'ml-32' : 'ml-12'}`}>
          <h1 className="text-white text-3xl font-bold mb-6">Your Spotify Playlists</h1>
          {playlistsMessage ? (
            <p className="text-red-500">{playlistsMessage}</p>
          ) : playlists.length > 0 ? (
            <div className="w-full max-w-6xl mx-auto">
              <Carousel responsive={responsive} arrows={true}>
                {playlists.map((playlist, index) => {
                  const playlistImageUrl = playlist.images?.[0]?.url;

                  return (
                    <button
                      key={index}
                      onClick={() => fetchPlaylistTracks(playlist.id)}
                      className="flex flex-col items-center p-4 bg-white rounded-md hover:shadow-lg transition-shadow duration-200"
                    >
                      {playlistImageUrl && (
                        <img
                          src={playlistImageUrl}
                          alt={`Cover art for ${playlist.name}`}
                          className="w-36 h-36 object-cover rounded-md mb-2"
                        />
                      )}
                      <p className="text-black font-bold">{playlist.name}</p>
                      <p className="text-black">{playlist.tracks.total} songs</p>
                    </button>
                  );
                })}
              </Carousel>
            </div>
          ) : (
            <p className="text-white">Loading your playlists...</p>
          )}

          {/* Tracks Section */}
          {selectedPlaylist && playlistTracks?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-white text-2xl font-bold mb-4">Tracks</h2>
              <div className="bg-black p-4 rounded-md max-h-[300px] overflow-y-auto">
                <ul>
                  {playlistTracks.map((track, index) => (
                    <li
                      key={index}
                      className="flex items-center text-white p-2 hover:bg-gray-700 rounded"
                    >
                      <button
                        onClick={() => playTrack(track.track.uri)} // Play track on click
                        className="flex items-center w-full"
                      >
                        {track.track?.album?.images[0]?.url && (
                          <img
                            src={track.track.album.images[0].url}
                            alt={track.track.name}
                            className="w-12 h-12 rounded mr-4"
                          />
                        )}
                        <div>
                          <p className="font-bold">{track.track?.name || 'Unknown Track'}</p>
                          <p className="text-sm">
                            {track.track?.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                          </p>
                        </div>
                      </button>
                      {/* Review Button */}
                      <div className="ml-auto">
  <Link
    href={{
      pathname: '/Review',
      query: { 
        songName: track.track.name, 
        artistName: track.track.artists.map(artist => artist.name).join(', '), // Join multiple artists
        spotifyId: track.track.id 
      },
    }}
  >
    <button className="bg-blue-500 text-white px-4 py-2 rounded">Review</button>
  </Link>
</div>

                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
