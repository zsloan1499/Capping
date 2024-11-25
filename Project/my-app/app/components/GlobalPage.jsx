'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; 
import Head from 'next/head';
import { BellIcon, CogIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function Top50US() {
  const { data: session, status } = useSession();
  const [topTracks, setTopTracks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackUri, setCurrentTrackUri] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const fetchTopTracks = async () => {
      if (status === 'authenticated' && session?.accessToken) {
        try {
          const response = await fetch('/api/getTopTracks', {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setTopTracks(data); 
          } else {
            const errorData = await response.json();
            setErrorMessage(`Failed to fetch top tracks: ${errorData.error}`);
          }
        } catch (error) {
          console.error('Error fetching top tracks:', error);
          setErrorMessage('An error occurred while fetching top tracks.');
        }
      } else {
        setErrorMessage('Please log in with Spotify to view the Top 50 US songs.');
      }
    };

    fetchTopTracks();
  }, [status, session?.accessToken]);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const playTrack = (uri) => {
    if (player) {
      player._options.getOAuthToken((token) => {
        fetch(`https://api.spotify.com/v1/me/player/play`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [uri] }),
        });
      });
    }
  };

  const saveTrackToLibrary = async (id) => {
    const accessToken = session?.accessToken;
    if (!accessToken) {
      alert('You need to log in first!');
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert('Track saved to your library!');
      } else {
        const errorData = await response.json();
        alert(`Failed to save track: ${errorData.error.message}`);
      }
    } catch (error) {
      console.error('Error saving track:', error);
      alert('An error occurred while saving the track.');
    }
  };

  return (
    <div className="bg-customBlue w-screen h-screen flex overflow-x-hidden">
      {/* Left Side Navigation Bar */}
      <nav className={`bg-black ${isNavOpen ? 'w-42' : 'w-42'} sticky top-0 h-auto p-4 flex flex-col space-y-4 transition-width duration-300`}>
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

      {/* Main Content Area */}
      <div className={`flex-grow p-8 ${isNavOpen ? 'ml-32' : 'ml-12'}`}>
        <title>Melodi</title>
        <div className="flex items-center justify-between">
          <h1 className="text-white text-3xl font-bold">Melodi</h1>
          <div className="flex items-center space-x-4">
            <Link href="/UserInfo">
              <img src={session?.user?.profilePhoto || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"} alt="User Profile Photo" className="w-6 h-6" />
            </Link>
            <button className="text-white relative">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center" />
            </button>
            <button className="text-white">
              <CogIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <Head>
          <title>Top 50 Songs in the US</title>
          <script src="https://sdk.scdn.co/spotify-player.js"></script>
        </Head>

        <h1 className="text-white text-3xl font-bold mb-6">Top 50 Songs in the US</h1>

        {errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : (
          <ul className="bg-black p-4 rounded-md w-full max-w-xl space-y-4">
            {topTracks.map((track, index) => (
              <li key={index} className="flex items-center text-white p-2 hover:bg-gray-700 rounded">
                <img src={track.track.album.images[0]?.url} alt={track.track.name} className="w-12 h-12 rounded-md mr-4" />
                <div className="flex-grow">
                  <p className="font-bold">{track.track.name}</p>
                  <p>{track.track.artists.map((artist) => artist.name).join(', ')}</p>
                </div>
                <button onClick={() => playTrack(track.track.uri)} className="bg-green-500 text-white p-2 rounded ml-2">Play</button>
                <button onClick={() => saveTrackToLibrary(track.track.id)} className="bg-blue-500 text-white p-2 rounded ml-2">Save</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


