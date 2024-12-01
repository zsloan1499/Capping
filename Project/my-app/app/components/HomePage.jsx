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
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistsMessage, setPlaylistsMessage] = useState('');
  const [topArtists, setTopArtists] = useState([]);
  const [artistsMessage, setArtistsMessage] = useState('');
  const [recentlyPlayedAlbums, setRecentlyPlayedAlbums] = useState([]);
  const [albumsMessage, setAlbumsMessage] = useState('');
  const [recentlyListenedArtists, setRecentlyListenedArtists] = useState([]);


  // Carousel item class with updated styles
  const carouselItemClass =
    'carousel-item flex flex-col items-center justify-center p-4 bg-[#F5FFFA] hover:bg-[#FFC0CB] min-h-[280px] hover:scale-125 transition transform duration-300';

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
      items: 6
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2
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

  //useEffect hook to fetch recently played songs 
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

  //useEffect hook to fetch users playlists 
  useEffect(() => {
    const fetchUserPlaylists = async () => {
      try {
        const accessToken = sessionStorage.getItem('spotifyAccessToken');
  
        if (!accessToken) {
          setPlaylistsMessage('Please log in with Spotify to view your playlists.');
          return;
        }
  
        const response = await fetch('/api/getUserPlaylists', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setUserPlaylists(data);
        } else {
          const errorData = await response.json();
          setPlaylistsMessage(`Failed to fetch playlists: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setPlaylistsMessage('An error occurred while fetching playlists.');
      }
    };
  
    fetchUserPlaylists();
  }, []);

  //useEffect hook to fetch users top artists 
  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const accessToken = sessionStorage.getItem('spotifyAccessToken');
  
        if (!accessToken) {
          setArtistsMessage('Please log in with Spotify to view your top artists.');
          return;
        }
  
        const response = await fetch('/api/getTopArtists', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setTopArtists(data);
        } else {
          const errorData = await response.json();
          setArtistsMessage(`Failed to fetch top artists: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error fetching top artists:', error);
        setArtistsMessage('An error occurred while fetching top artists.');
      }
    };
  
    fetchTopArtists();
  }, []);

  //useEffect hook to fetch users recent listened to albums 
  useEffect(() => {
    const fetchRecentlyPlayedAlbums = async () => {
      try {
        const accessToken = sessionStorage.getItem('spotifyAccessToken');
  
        if (!accessToken) {
          setAlbumsMessage('Please log in with Spotify to view your recently played albums.');
          return;
        }
  
        const response = await fetch('/api/getRecentlyPlayedAlbums', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setRecentlyPlayedAlbums(data);
        } else {
          const errorData = await response.json();
          setAlbumsMessage(`Failed to fetch recently played albums: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error fetching recently played albums:', error);
        setAlbumsMessage('An error occurred while fetching recently played albums.');
      }
    };
  
    fetchRecentlyPlayedAlbums();
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
  
  {/*can delete this part if not using search on homepage */}
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
        {/*can delete this part if not using search on homepage */}

        {/* Carousel Section - Recently Played Songs */}
<div style={carouselContainerStyle} className="w-full mt-8">
  <h4 className="text-white text-2xl mb-4">Your Recently Listened Songs</h4>
  {message && <p className="text-red-500">{message}</p>}
  {recentlyPlayedSongs.length > 0 ? (
    <Carousel responsive={responsive} arrows={true}>
      {recentlyPlayedSongs.map((item, index) => {
        const track = item.track;
        const albumImageUrl = track.album.images?.[0]?.url;
        const spotifyUrl = track.external_urls.spotify;

        return (
          <a
            key={index}
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={carouselItemClass}
          >
            {albumImageUrl ? (
              <img
                src={albumImageUrl}
                alt={`Album art for ${track.name}`}
                className="w-40 h-40 object-cover mb-2 rounded-full"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-300 flex items-center justify-center rounded-full mb-2">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
            <p className="text-black text-center font-bold text-sm m-0 truncate w-full">
              {track.name}
            </p>
            <p className="text-black text-center text-xs m-0 truncate w-full">
              {track.artists.map((artist) => artist.name).join(', ')}
            </p>
          </a>
        );
      })}
    </Carousel>
  ) : (
    !message && <p className="text-white">Loading recently played songs...</p>
  )}
</div>
  
        {/* Carousel Section - Your Playlists */}
<div style={carouselContainerStyle} className="w-full mt-8">
  <h2 className="text-white text-2xl mb-4">Your Playlists</h2>
  {playlistsMessage && <p className="text-red-500">{playlistsMessage}</p>}
  {userPlaylists.length > 0 ? (
    <Carousel responsive={responsive} arrows={true}>
      {userPlaylists.map((playlist, index) => {
        const playlistImageUrl = playlist.images?.[0]?.url;

        return (
          <div key={index} className={carouselItemClass}>
            {playlistImageUrl ? (
              <img
                src={playlistImageUrl}
                alt={`Cover art for ${playlist.name}`}
                className="w-40 h-40 object-cover mb-2 rounded-lg"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-300 flex items-center justify-center rounded-lg mb-2">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
            <p className="text-black text-center font-bold m-0 truncate w-full">
              {playlist.name}
            </p>
            <p className="text-black text-center m-0">
              {playlist.tracks.total} songs
            </p>
          </div>
        );
      })}
    </Carousel>
  ) : (
    !playlistsMessage && <p className="text-white">Loading your playlists...</p>
  )}
</div>
  
       {/* Carousel Section - Top Artists */}
<div style={carouselContainerStyle} className="w-full mt-8">
  <h2 className="text-white text-2xl mb-4">Your Top Artists</h2>
  {artistsMessage && <p className="text-red-500">{artistsMessage}</p>}
  {topArtists.length > 0 ? (
    <Carousel responsive={responsive} arrows={true}>
      {topArtists.map((artist, index) => {
        const artistImageUrl = artist.images.length > 0 ? artist.images[0].url : null;
        const spotifyUrl = artist.external_urls.spotify;

        return (
          <a
            key={index}
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={carouselItemClass}
          >
            {artistImageUrl ? (
              <img
                src={artistImageUrl}
                alt={`Image of ${artist.name}`}
                className="w-40 h-40 object-cover mb-2 rounded-full"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-300 flex items-center justify-center rounded-full mb-2">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
            <p className="text-black text-center font-bold m-0 truncate w-full">
              {artist.name}
            </p>
            <p className="text-black text-center m-0 truncate w-full">
              {artist.genres.slice(0, 2).join(', ')}
            </p>
          </a>
        );
      })}
    </Carousel>
  ) : (
    !artistsMessage && <p className="text-white">Loading top artists...</p>
  )}
</div>

{/* Carousel Section - Recently Played Albums */}
<div style={carouselContainerStyle} className="w-full mt-8 mb-8">
  <h2 className="text-white text-2xl mb-4">Recently Played Albums</h2>
  {albumsMessage && <p className="text-red-500">{albumsMessage}</p>}
  {recentlyPlayedAlbums.length > 0 ? (
    <Carousel responsive={responsive} arrows={true}>
      {recentlyPlayedAlbums.map((album, index) => {
        const spotifyUrl = album.external_urls.spotify;

        return (
          <a
            key={index}
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={carouselItemClass}
          >
            {album.images[0]?.url ? (
              <img
                src={album.images[0]?.url}
                alt={`Album art for ${album.name}`}
                className="w-40 h-40 object-cover mb-2 rounded-lg"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-300 flex items-center justify-center rounded-lg mb-2">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
            <p className="text-black text-center font-bold m-0 truncate w-full">
              {album.name}
            </p>
            <p className="text-black text-center m-0 truncate w-full">
              {album.artists.map((artist) => artist.name).join(', ')}
            </p>
          </a>
        );
      })}
    </Carousel>
  ) : (
    !albumsMessage && <p className="text-white">Loading recently played albums...</p>
  )}
</div>

      </div>
    </div>
  );
  
}
