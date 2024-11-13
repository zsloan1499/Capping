'use client';

import { BellIcon, CogIcon } from '@heroicons/react/24/solid'; // Import Bell and Cog icons
import { useState, useEffect } from 'react'; // Import useState for managing state
import Link from 'next/link';
import { useSession } from "next-auth/react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { searchSpotify } from "../api/searchSpotify/route"; // Ensure correct path to the search program

export default function HomePage() {
  const { data: session } = useSession(); 
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [recentlyPlayedSongs, setRecentlyPlayedSongs] = useState([]);
  const [message, setMessage] = useState('');

  const itemStyle = {
    //width: '100%',  // Ensure each item takes up full width of the carousel container
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px', // Example height, adjust as needed
    backgroundColor: '#f0f0f0', // Example background color
    //padding: '100px',
    //boxSizing: 'border-box',
    minHeight: '300px', // im using this to adjust the position of images 
    overflow: 'hidden',
  };

  const carouselContainerStyle = {
    width: '80vw',  // Take full screen width
    overflow: 'hidden',  // Prevent overflow of carousel items
    margin: '0 auto',    // Center the carousel container
  };

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 4
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleSearch = async () => {
    try {
        const response = await searchSpotify(query);
        if (response.error) {
            setError(response.error);
        } else {
            setResults(response);
            setError(null);
        }
    } catch (err) {
        console.error('Search error:', err);
        setError('An unexpected error occurred while searching.');
    }
  };

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      try {
        const accessToken = sessionStorage.getItem('spotifyAccessToken');
  
        if (!accessToken) {
          setMessage('Spotify access token not found. Please login with Spotify.');
          return;
        }
  
        // Call backend API
        const response = await fetch('/api/getRecentlyPlayedSongs', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setRecentlyPlayedSongs(data.slice(0, 9)); // Get the last 9 songs
        } else {
          const errorData = await response.json();
          setMessage(`Failed to fetch recently played songs: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error fetching recently played songs:', error);
        setMessage('An error occurred while fetching recently played songs.');
      }
    };
  
    fetchRecentlyPlayed();
  }, []);

  return (
    <div className="bg-customBlue w-screen h-screen flex overflow-x-hidden">
      {/* Left Side Navigation Bar */}
      <nav className={`bg-black ${isNavOpen ? 'w-42' : 'w-42'} sticky top-0 h-auto p-4 flex flex-col space-y-4 transition-width duration-300`}>
        <button
            className="bg-blue-500 text-white p-2 rounded mb-4 w-16"
            onClick={toggleNav}
        >
            {isNavOpen ? 'Close' : 'Open'}
        </button>

        {isNavOpen && (
            <>
                <Link href="/placeholder1" className="text-white p-2 hover:bg-gray-700 rounded">New Playlist/Review</Link>
                <Link href="/placeholder2" className="text-white p-2 hover:bg-gray-700 rounded">Playlists</Link>
                <Link href="/rate-song" className="text-white p-2 hover:bg-gray-700 rounded">Reviews</Link>
                <Link href="/Social" className="text-white p-2 hover:bg-gray-700 rounded">Social</Link>
                <Link href="/Review" className="text-white p-2 hover:bg-gray-700 rounded">Global Ranking</Link>
            </>
        )}
    </nav>
  
      {/* Main Content Area */}
      <div className={`flex-grow p-8 ${isNavOpen ? 'ml-32' : 'ml-12'}`}>
        <title>Melodi</title>
        <div className="flex items-center justify-between">
          <h1 className="text-white text-3xl font-bold">Melodi</h1>
  
          {/* Icons and Profile Photo */}
          <div className="flex items-center space-x-4">
            {/* Profile Photo */}
            <Link href="/UserInfo">
              <img src={session?.user?.profilePhoto || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"} alt="User Profile Photo" className="w-6 h-6" />
            </Link>
  
            {/* Notification Bell Icon */}
            <button className="text-white relative">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {/* Optional notification content */}
              </span>
            </button>
  
            {/* Settings Icon */}
            <button className="text-white">
              <CogIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
  
        <div className="mt-8">
          <h2 className="text-white text-2xl">Spotify Search</h2>
            <input
              type="text"
              placeholder="Search for a song, artist, or album..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="p-2 rounded border border-gray-300 w-full mt-2"
            />
            <button onClick={handleSearch} className="mt-2 bg-blue-500 text-white p-2 rounded">Search</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {results && results.tracks && (
              <div className="mt-4">
                <h2 className="text-white text-xl">Search Results</h2>
                <ul className="text-white">
                  {results.tracks.items.map((track) => (
                    <li key={track.id} className="mt-2">
                      {track.name} by {track.artists.map((artist) => artist.name).join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        {/* Carousel Section - Recently Played Songs */}
<div style={carouselContainerStyle} className="w-full mt-8">
  {message && <p className="text-red-500">{message}</p>}
  {recentlyPlayedSongs.length > 0 ? (
    <Carousel responsive={responsive} arrows={true}>
      {recentlyPlayedSongs.map((item, index) => {
        const track = item.track;
        const albumImages = track.album.images;
        const albumImageUrl =
          albumImages && albumImages.length > 0 ? albumImages[0].url : null;

        return (
          <div
      key={index}
      className="carousel-item"
      style={{
      display: 'flex',
        flexDirection: 'column', // Stack items vertically
        alignItems: 'center',
        padding: '10px',
        boxSizing: 'border-box',
        minHeight: '220px', // Adjust as needed
      }}
    >
      {albumImageUrl && (
        <img
          src={albumImageUrl}
          alt={`Album art for ${track.name}`}
          style={{
            width: '10rem',
            height: '10rem',
            objectFit: 'cover',
            marginBottom: '0.5rem',
            borderRadius: '9999px',
          }}
        />
      )}
      {/* Text Container */}
      <div
        className="text-container"
        style={{
          display: 'flex',
          flexDirection: 'column', // Stack text elements vertically
          alignItems: 'center',
        }}
      >
        <p
          style={{
            color: 'black',
            textAlign: 'center',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          {track.name}
        </p>
        <p
          style={{
            color: 'black',
            textAlign: 'center',
            margin: 0,
          }}
        >
          {track.artists.map((artist) => artist.name).join(', ')}
        </p>
      </div>
    </div>
  );
})}
    </Carousel>
  ) : (
    !message && <p className="text-white">Loading recently played songs...</p>
  )}
</div>
  
        {/* Carousel Section - Your Playlists */}
        <div style={carouselContainerStyle} className="w-full mt-8">
          <Carousel responsive={responsive} arrows={true}>
            <div style={itemStyle}>Item 1</div>
            <div style={itemStyle}>Item 2</div>
            <div style={itemStyle}>Item 3</div>
            <div style={itemStyle}>Item 4</div>
            <div style={itemStyle}>Item 5</div>
            <div style={itemStyle}>Item 6</div>
            <div style={itemStyle}>Item 7</div>
            <div style={itemStyle}>Item 8</div>
            <div style={itemStyle}>Item 9</div>
          </Carousel>
        </div>
  
        {/* Carousel Section - Reviews */}
        <div style={carouselContainerStyle} className="w-full mt-8">
          <Carousel responsive={responsive} arrows={true}>
            <div style={itemStyle}>Item 1</div>
            <div style={itemStyle}>Item 2</div>
            <div style={itemStyle}>Item 3</div>
            <div style={itemStyle}>Item 4</div>
            <div style={itemStyle}>Item 5</div>
            <div style={itemStyle}>Item 6</div>
            <div style={itemStyle}>Item 7</div>
            <div style={itemStyle}>Item 8</div>
            <div style={itemStyle}>Item 9</div>
          </Carousel>
        </div>

      </div>
    </div>
  );
  
}
