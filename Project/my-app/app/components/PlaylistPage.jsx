'use client';

import Head from 'next/head'; 
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react'; 
import Link from 'next/link';
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";
import { BellIcon, CogIcon } from '@heroicons/react/24/solid';

//Playlist Page
export default function SpotifyPlaylists() {
  const { data: session } = useSession(); // Access the user session
  const [playlists, setPlaylists] = useState([]); // For user playlists
  const [suggestedPlaylists, setSuggestedPlaylists] = useState([]); // For suggested playlists
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [playlistsMessage, setPlaylistsMessage] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [player, setPlayer] = useState(null); // Spotify player instance, no longer used
  const [isPlaying, setIsPlaying] = useState(false); // Playback state, no longer used
  const [genres, setGenres] = useState([]); // To store genres from recently played songs

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  // Fetch recently played songs with genres
  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      try {
        const accessToken = sessionStorage.getItem('spotifyAccessToken');
  
        if (!accessToken) {
          setPlaylistsMessage('Spotify access token not found. Please login with Spotify.');
          return;
        }
        //route call, send spotify access token
        const response = await fetch('/api/getRecentlyPlayedSongsPlaylists', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
  
          // Extract genres from the recently played songs
          const fetchedGenres = data.reduce((acc, song) => {
            song.genres.forEach(genre => {
              if (!acc.includes(genre)) {
                acc.push(genre);
              }
            });
            return acc;
          }, []);
  
          setGenres(fetchedGenres); // Store the unique genres from the recently fetched genres
          setPlaylistsMessage(''); // Clear the message
        } else {
          const errorData = await response.json();
          setPlaylistsMessage(`Failed to fetch recently played songs: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error fetching recently played songs:', error);
        setPlaylistsMessage('An error occurred while fetching recently played songs.');
      }
    };

    fetchRecentlyPlayed();
  }, []);

  // Fetch suggested playlists based on genres
  useEffect(() => {
    const fetchSuggestedPlaylists = async () => {
      try {
        const accessToken = sessionStorage.getItem('spotifyAccessToken');
        if (!accessToken || genres.length === 0) return; // Don't fetch if no genres are available
  
        //route call to get playlist, send access token
        const response = await fetch('/api/getSuggestedPlaylists', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ genres }), // Send genres in the request
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestedPlaylists(data);
        } else {
          console.error('Failed to fetch suggested playlists');
        }
      } catch (error) {
        console.error('Error fetching suggested playlists', error);
      }
    };

    fetchSuggestedPlaylists();
  }, [genres]); // Trigger when genres are fetched

  // Fetch user playlists from spotify, send access keys
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
          const filteredPlaylists = data.filter(playlist => playlist?.images?.[0]?.url);
          setPlaylists(filteredPlaylists);
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

  // Fetch tracks for a specific playlist when the playlist is clicked on
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

  // Play track function, no longer used
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

  return (
    <div className="bg-customBlue w-screen h-screen flex flex-col">
      <Head>
        <script type="text/javascript" src="https://sdk.scdn.co/spotify-player.js"></script>
      </Head>

      {/* Main Header */}
      <div className="p-4 bg-black text-white flex items-center justify-between shadow-md z-50">
        <h1 className="text-3xl font-bold">Melodi</h1>
        <div className="flex items-center space-x-4">
          {session?.user ? (
            <Link href="/UserInfo">
              <img
                src={session.user.profilePhoto || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
                alt="User Profile Photo"
                className="w-10 h-10 rounded-full"
              />
            </Link>
          ) : (
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => signIn('spotify')}>
              Sign In
            </button>
          )}
          <button className="text-white relative">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </button>
          <button className="text-white">
            <CogIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="flex flex-grow overflow-hidden">
        <nav className={`bg-black ${isNavOpen ? 'w-42' : 'w-42'} sticky top-0 h-full p-4 flex flex-col space-y-4 transition-width duration-300`}>
          <button className="bg-blue-500 text-white p-2 rounded mb-4 w-16" onClick={toggleNav}>
            {isNavOpen ? 'Close' : 'Open'}
          </button>
          {isNavOpen && (
            <>
            <Link href="/" className="text-white p-2 hover:bg-gray-700 rounded">Home</Link>
            <Link href="/Playlists" className="text-white p-2 hover:bg-gray-700 rounded">Playlists</Link>
            <Link href="/Review" className="text-white p-2 hover:bg-gray-700 rounded">Reviews</Link>
            <Link href="/Social" className="text-white p-2 hover:bg-gray-700 rounded">Social</Link>
            <Link href="/Activity" className="text-white p-2 hover:bg-gray-700 rounded w-full">Activity</Link>
            <Link href="/Global" className="text-white p-2 hover:bg-gray-700 rounded">Global</Link>
            </>
          )}
        </nav>

        <div className="flex-grow p-8 overflow-y-auto">
          {/* Suggested Playlists Section */}
          <h1 className="text-white text-3xl font-bold mb-6">Suggested Playlists</h1>
{playlistsMessage ? (
  <p className="text-red-500">{playlistsMessage}</p>
) : suggestedPlaylists.length > 0 ? (
  <div className="w-full max-w-6xl mx-auto">
    <Carousel responsive={responsive} arrows={true}>
      {suggestedPlaylists
        .filter(playlist => playlist?.images?.[0]?.url) // Only include playlists with an image
        .slice(0, 5) // Limit to 5 playlists
        .map((playlist, index) => {
          const playlistImageUrl = playlist?.images?.[0]?.url;
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
              <p className="text-black font-bold text-ellipsis overflow-hidden whitespace-nowrap" style={{ fontSize: '14px' }}>
                {playlist?.name?.slice(0, 25)}{playlist?.name?.length > 25 ? '...' : ''}
              </p>
              <p className="text-black text-sm">{playlist?.tracks?.total} songs</p>
            </button>
          );
        })}
    </Carousel>
  </div>
) : (
  <p className="text-white">Loading suggested playlists...</p>
)}

          {/* User Playlists Section */}
          <h1 className="text-white text-3xl font-bold mb-6">Your Spotify Playlists</h1>
          {playlistsMessage ? (
            <p className="text-red-500">{playlistsMessage}</p>
          ) : playlists.length > 0 ? (
            <div className="w-full max-w-6xl mx-auto">
              <Carousel responsive={responsive} arrows={true}>
                {playlists.map((playlist, index) => {
                  const playlistImageUrl = playlist?.images?.[0]?.url;
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
                      <p className="text-black font-bold text-ellipsis overflow-hidden whitespace-nowrap" style={{ fontSize: '14px' }}>
                        {playlist?.name?.slice(0, 25)}{playlist?.name?.length > 25 ? '...' : ''}
                      </p>
                      <p className="text-black text-sm">{playlist?.tracks?.total} songs</p>
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
                    <li key={index} className="flex items-center text-white p-2 hover:bg-gray-700 rounded">
                      <button onClick={() => playTrack(track.track.uri)} className="flex items-center w-full">
                        {track.track?.album?.images?.[0]?.url && (
                          <img
                            src={track.track.album.images[0].url}
                            alt={track.track.name}
                            className="w-12 h-12 rounded mr-4"
                          />
                        )}
                        <div className="flex flex-col ml-2">
                          <p className="font-bold text-left truncate">{track.track?.name || 'Unknown Track'}</p>
                          <p className="text-sm text-left truncate">{track.track?.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}</p>
                        </div>
                      </button>
                      <div className="ml-auto">
                        <Link
                          href={{
                            pathname: '/Review',
                            query: {
                              songName: track.track.name,
                              artistName: track.track.artists.map(artist => artist.name).join(', '),
                              spotifyId: track.track.id,
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
