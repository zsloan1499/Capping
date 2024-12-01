'use client';

import { BellIcon, CogIcon } from '@heroicons/react/24/solid'; // Import icons
import { useState, useEffect } from 'react'; // Import useState and useEffect
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { FaThumbsUp } from 'react-icons/fa';

export default function ActivityPage() {
  const { data: session } = useSession();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Following'); // Manage active tab state
  const [reviews, setReviews] = useState([]); // State for reviews
  const [suggestedReviews, setSuggestedReviews] = useState([]); // State for suggested reviews
  const [recentlyPlayedSongs, setRecentlyPlayedSongs] = useState([]); // Recently played songs
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(''); // Error state for API calls
  const [message, setMessage] = useState(''); // Status message

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  // Fetch reviews when tabs change
  useEffect(() => {
    if (activeTab === 'Following') {
      fetchReviews();
    } else if (activeTab === 'Suggested') {
      fetchSuggestedReviews(); // Fetch suggested reviews when "Suggested" tab is active
    }
  }, [activeTab]); // Watch for changes to the activeTab state

  // Fetch reviews for "Following" tab
  const fetchReviews = async () => {
    if (!session || !session.user) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/getFollowingReviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }), // Pass the current user's ID
      });

      const data = await response.json();
      if (response.ok) {
        setReviews(data.reviews || []);
      } else {
        setError(data.error || 'Failed to fetch reviews.');
      }
    } catch (err) {
      setError('An error occurred while fetching reviews.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recently played songs for suggested reviews
  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      try {
        const accessToken = sessionStorage.getItem('spotifyAccessToken');
  
        if (!accessToken) {
          setMessage('Spotify access token not found. Please login with Spotify.');
          return;
        }
  
        const response = await fetch('/api/getRecentlyPlayedSongsReviews', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
  
          // Log the full data first to see the structure
          console.log("Recently Played Songs with Genres:", data);
  
          // Process the data to display genres
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
  
  // Fetch reviews for "Suggested" tab based on recently played songs
  const fetchSuggestedReviews = async () => {
    if (!session || recentlyPlayedSongs.length === 0) return;
  
    setLoading(true);
    setError('');
    try {
      // Extract and flatten genres from each song
      const genres = recentlyPlayedSongs.flatMap(song => song.genres || []); // Ensure we only grab the genres
  
      // If genres is empty, we should return early to avoid errors
      if (genres.length === 0) {
        setError('No genres found in recently played songs.');
        setLoading(false);
        return;
      }
  
      const response = await fetch('/api/getSuggestedReviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genres }), // Send only the genres array
      });
  
      const data = await response.json();
      if (response.ok) {
        setSuggestedReviews(data.reviews || []);
      } else {
        setError(data.error || 'Failed to fetch suggested reviews.');
      }
    } catch (err) {
      setError('No reviews found.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  
  async function handleLike(reviewId) {
    try {
      const response = await fetch("/api/addLike", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.id, reviewId }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.message);

        // Update the like count in the local state for both tabs
        const updateReviewLikes = (reviewsList) => 
          reviewsList.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  likes: Array.isArray(review.likes)
                    ? data.message.includes("unliked")
                      ? review.likes.filter((id) => id !== session.user.id)
                      : [...review.likes, session.user.id]
                    : review.likes + (data.message.includes("unliked") ? -1 : 1),
                }
              : review
          );

        setReviews((prevReviews) => updateReviewLikes(prevReviews));
        setSuggestedReviews((prevReviews) => updateReviewLikes(prevReviews));
      } else {
        console.error(data.error || "Failed to toggle like.");
      }
    } catch (err) {
      console.error("Error while toggling like:", err);
    }
  }

  return (
    <div className="bg-customBlue w-screen h-screen flex overflow-x-hidden">
      {/* Left Side Navigation Bar */}
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
            <Link href="/Activity" className="text-white p-2 hover:bg-gray-700 rounded w-full">Activity</Link>
            <Link href="/Global" className="text-white p-2 hover:bg-gray-700 rounded">Global</Link>
          </>
        )}
      </nav>

      {/* Main Content Area */}
      <div className={`flex-grow p-8 ${isNavOpen ? 'ml-32' : 'ml-12'}`}>
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-white text-3xl font-bold">Melodi</h1>

          {/* Icons and Profile Photo */}
          <div className="flex items-center space-x-4">
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

        {/* Page Title */}
        <h1 className="text-white text-3xl font-bold mb-4">Activity</h1>

        {/* Tabs Section */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('Following')}
            className={`p-2 px-6 rounded ${activeTab === 'Following' ? 'bg-customBlue2 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Following
          </button>
          <button
            onClick={() => {
              setActiveTab('Suggested');
              fetchSuggestedReviews(); // Call the function directly when switching to "Suggested"
            }}
            className={`p-2 px-6 rounded ${activeTab === 'Suggested' ? 'bg-customBlue2 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Suggested
          </button>

        </div>

        {/* Content Section */}
        <div className="bg-gray-800 p-4 rounded shadow-md">
          {loading && <p className="text-white">Loading reviews...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && activeTab === 'Following' && (
            reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="bg-gray-900 p-3 mb-4 rounded text-white">
                  <p><strong>User:</strong> {review.username}</p>
                  <p><strong>Song:</strong> {review.songName} by {review.songArtist}</p>
                  <p><strong>Rating:</strong> {review.rating}</p>
                  <p><strong>Review:</strong> {review.reviewText}</p>
                  <button
                    onClick={() => handleLike(review.id)}
                    className="flex items-center gap-2 bg-gray-800 p-2 rounded hover:bg-gray-700 mt-4"
                  >
                    <FaThumbsUp className="text-white" />
                    <span>{Array.isArray(review.likes) ? review.likes.length : review.likes}</span>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-300">No reviews found from users you follow.</p>
            )
          )}

          {!loading && !error && activeTab === 'Suggested' && (
            suggestedReviews.length > 0 ? (
              suggestedReviews.map((review, index) => (
                <div key={index} className="bg-gray-900 p-3 mb-4 rounded text-white">
                  <p><strong>User:</strong> {review.username}</p>
                  <p><strong>Song:</strong> {review.songName} by {review.songArtist}</p>
                  <p><strong>Rating:</strong> {review.rating}</p>
                  <p><strong>Review:</strong> {review.reviewText}</p>
                  <button
                    onClick={() => handleLike(review.id)}
                    className="flex items-center gap-2 bg-gray-800 p-2 rounded hover:bg-gray-700 mt-4"
                  >
                    <FaThumbsUp className="text-white" />
                    <span>{Array.isArray(review.likes) ? review.likes.length : review.likes}</span>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-300">No suggested reviews found. Try exploring more music.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
