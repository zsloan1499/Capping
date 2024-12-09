'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; 
import { BellIcon, CogIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function Top50US() {
  const { data: session, status } = useSession();
  const [songs, setSongs] = useState([]); // Store songs with average ratings
  const [errorMessage, setErrorMessage] = useState('');
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackUri, setCurrentTrackUri] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // useEffect to fetch top songs when the component mounts
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch('/api/getGlobalRanking'); // Your API endpoint to fetch top songs
        const data = await response.json();
        
        if (response.ok) {
          setSongs(data); // Set the songs in state
        } else {
          setErrorMessage('Failed to fetch songs');
        }
      } catch (error) {
        setErrorMessage('An error occurred while fetching songs');
        console.error(error);
      }
    };

    fetchSongs();
  }, []); // Empty dependency array to run once on mount

  return (
    <div className="bg-customBlue w-screen h-screen flex overflow-x-hidden">
      {/* Left Side Navigation Bar */}
      <nav className={`bg-black ${isNavOpen ? 'w-42' : 'w-42'} sticky top-0 h-auto p-4 flex flex-col space-y-4 transition-width duration-300`}>
        <button className="bg-blue-500 text-white p-2 rounded mb-4 w-16" onClick={() => setIsNavOpen(!isNavOpen)}>
          {isNavOpen ? 'Close' : 'Open'}
        </button>

        {isNavOpen && (
          <>
            <Link href="/dashboard" className="text-white p-2 hover:bg-gray-700 rounded">Home</Link>
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
        <div className="flex items-center justify-between ">
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

        <h2 className="text-white text-3xl font-bold mt-10 mb-10">Top 50 Rated Songs</h2>

        {errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : (
          <ul className="bg-black p-4 rounded-md w-full space-y-4">
  {songs.map((song, index) => (
    <li key={index} className="flex items-center text-white p-2 hover:bg-gray-700 rounded">
      <Link
        href={{
          pathname: '/GlobalReviews',
          query: {
            songId: song.id, // Sending the song ID as part of the query
            songName: song.name, // Optional: Passing the song name
            artistName: song.artist, // Optional: Passing the artist name
          },
        }}
      >
        <div className="flex items-center space-x-4 w-full cursor-pointer">
          <span className="text-xl font-semibold">{`#${index + 1}`}</span> {/* Song rank */}
          <div className="flex-grow">
            <p className="font-bold">{song.name}</p> {/* Song title */}
            <p className="text-sm">{song.artist}</p> {/* Artist name */}
            <p className="text-sm text-gray-400">Average Rating: {song.averageRating.toFixed(1)}</p> {/* Average rating */}
          </div>
        </div>
      </Link>
    </li>
  ))}
</ul>
        )}
      </div>
    </div>
  );
}
