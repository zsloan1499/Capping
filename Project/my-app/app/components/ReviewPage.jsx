'use client';

import { BellIcon, CogIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import "react-multi-carousel/lib/styles.css";
import { Editor, EditorState, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

export default function ReviewPage() {
  const { data: session } = useSession();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState('');
  const [selectedSong, setSelectedSong] = useState(null); // Stores the full song object
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // For handling query parameters in the URL
  const searchParams = useSearchParams();
  const songNameFromURL = searchParams.get('songName');
  const artistNameFromURL = searchParams.get('artistName');
  const spotifyIdFromURL = searchParams.get('spotifyId'); 

  const customStyleMap = {
    WHITE_TEXT: {
      color: 'white',
    },
  };

  const charLimit = 250;

  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const handleNumberChange = (event) => setSelectedNumber(event.target.value);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm) {
      setResults(null);
      setError(null);
      return;
    }

    try {
      const accessToken = sessionStorage.getItem("spotifyAccessToken");

      if (!accessToken) {
        setError("Spotify access token not found. Please login with Spotify.");
        return;
      }

      const response = await fetch(`/api/searchSpotifyZachReviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query: searchTerm }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Failed to fetch search results: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("An unexpected error occurred while searching.");
    }
  };

  useEffect(() => {
    if (spotifyIdFromURL && songNameFromURL && artistNameFromURL) {
      // If all parameters are found in the URL, set the full selected song object
      setSelectedSong({
        id: spotifyIdFromURL,
        name: songNameFromURL,
        artists: [{ name: artistNameFromURL }], // Ensure artists is an array
      });
    } else if (songNameFromURL && artistNameFromURL) {
      // Fallback to using song name and artist name if Spotify ID is not available
      setSelectedSong({
        name: songNameFromURL,
        artists: [{ name: artistNameFromURL }],
      });
    }
  }, [songNameFromURL, artistNameFromURL, spotifyIdFromURL]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(query);
      setShowDropdown(true);
    }, 300); // Adjust debounce delay as needed

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleReviewTextChange = (newState) => {
    const plainText = newState.getCurrentContent().getPlainText();
    if (plainText.length <= charLimit) {
      setEditorState(newState);
    }
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const reviewText = editorState.getCurrentContent().getPlainText();
    const userId = session?.user?.id;

    if (!selectedSong || !selectedNumber || !reviewText || !userId) {
      console.error("All fields are required!");
      return;
    }

    console.log("Selected song:", selectedSong);

    const songName = selectedSong.name;
    const artist = selectedSong.artists?.[0]?.name || "Unknown Artist";
    const spotifyId = selectedSong.id;

    if (!spotifyId) {
      console.error("Selected song does not have a Spotify ID.");
      return;
    }

    try {
      const response = await fetch('/api/addReview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songName,
          artist,
          selectedNumber,
          reviewText,
          userId,
          spotifyId,
        }),
      });

      const data = await response.json();
      console.log("Submitted data:", data);

      setSelectedSong(null);
      setSelectedNumber('');
      setEditorState(EditorState.createEmpty());
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleSelectSong = (song) => {
    setSelectedSong(song);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="bg-customBlue w-screen h-screen flex overflow-x-hidden">
      <nav className={`bg-black ${isNavOpen ? 'w-42' : 'w-42'} h-full p-4 flex flex-col space-y-4 transition-width duration-300`}>
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

      <div className={`flex-grow p-8 ${isNavOpen ? 'ml-32' : 'ml-12'}`}>
        <title>Melodi</title>
        <div className="flex items-center justify-between">
          <h1 className="text-white text-3xl font-bold">Review a Song</h1>
          <div className="flex items-center space-x-4">
            <Link href="/UserInfo">
              <img src={session?.user?.profilePhoto || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"} alt="User Profile Photo" className="w-6 h-6" />
            </Link>
            <button className="text-white relative">
              <BellIcon className="w-6 h-6" />
            </button>
            <button className="text-white">
              <CogIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <br />

        <div className="mt-8 relative">
          <h2 className="text-white text-2xl">Spotify Search</h2>
          <input
            type="text"
            placeholder="Search for a song, artist, or album..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="p-2 rounded border border-gray-300 w-full mt-2"
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {showDropdown && results && results.tracks && results.tracks.items && results.tracks.items.length > 0 && (
            <ul className="absolute w-full bg-white mt-2 border border-gray-300 shadow-md rounded-md z-10 max-h-64 overflow-y-auto">
              {results.tracks.items.map((track) => (
                <li
                  key={track.id}
                  onClick={() => handleSelectSong(track)}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {track.name} by {track.artists[0].name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="border border-gray-600 p-6 rounded-lg bg-gray-800 mt-6">
          <div className="flex items-center space-x-4">
            <label className="text-white">Selected Song:</label>
            <input
              type="text"
              value={selectedSong ? `${selectedSong.name} - ${selectedSong.artists?.[0]?.name}` : ''}
              readOnly
              className="ml-2 p-2 rounded bg-gray-900 text-white border border-gray-600 w-1/2"
            />
            <label className="text-white">Rate out of Ten:</label>
            <select
              id="numberSelect"
              value={selectedNumber}
              onChange={handleNumberChange}
              className="p-2 rounded bg-gray-900 text-white border border-gray-600 w-1/4"
            >
              <option value="">Select a rating</option>
              {[...Array(10).keys()].map(num => (
                <option key={num + 1} value={num + 1}>{num + 1}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 border border-gray-700 p-4 rounded-md bg-gray-900">
            <div style={{ minHeight: "100px", color: "white" }}>
              <Editor
                editorState={editorState}
                handleKeyCommand={handleKeyCommand}
                onChange={handleReviewTextChange}
                placeholder="Write your review here..."
                spellCheck={true}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-3 mt-4 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
