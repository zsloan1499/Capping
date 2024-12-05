'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function GlobalRanking() {
  const searchParams = useSearchParams();
  const songName = searchParams.get('songName');
  const artistName = searchParams.get('artistName'); // Optionally use this to display

  const [reviews, setReviews] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!songName) {
      console.error("No songName found in URL parameters");
      setErrorMessage("Song name is required to fetch reviews.");
      return;
    }

    // Fetch reviews for the song
    async function fetchReviews() {
      try {
        // Step 1: Get the songId from the backend using the song name
        const songResponse = await fetch('/api/getSongByName', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songName }),
        });

        const songData = await songResponse.json();

        if (!songResponse.ok) {
          setErrorMessage(songData.error || 'Failed to fetch song details');
          return;
        }

        const songId = songData.songId; // Extract the songId

        // Step 2: Fetch reviews using the songId
        const reviewResponse = await fetch('/api/getGlobalRankingReviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId }),
        });

        const reviewData = await reviewResponse.json();

        if (!reviewResponse.ok) {
          setErrorMessage(reviewData.error || 'Failed to fetch reviews');
          return;
        }

        setReviews(reviewData.reviews);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('An unexpected error occurred');
      }
    }

    fetchReviews();
  }, [songName]);

  return (
    <div className="bg-customBlue w-screen h-screen flex overflow-x-hidden">
      {/* Left Side Navigation Bar */}
      <nav className={`bg-black sticky top-0 h-auto p-4 flex flex-col space-y-4`}>
        <button
          className="bg-blue-500 text-white p-2 rounded mb-4 w-16"
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          {isNavOpen ? 'Close' : 'Open'}
        </button>
        <Link href="/" className="text-white p-2 hover:bg-gray-700 rounded">
          Home
        </Link>
        <Link href="/Playlists" className="text-white p-2 hover:bg-gray-700 rounded">Playlists</Link>
        <Link href="/Review" className="text-white p-2 hover:bg-gray-700 rounded">Reviews</Link>
        <Link href="/Social" className="text-white p-2 hover:bg-gray-700 rounded">Social</Link>
        <Link href="/Activity" className="text-white p-2 hover:bg-gray-700 rounded w-full">Activity</Link>
        <Link href="/Global" className="text-white p-2 hover:bg-gray-700 rounded">Global</Link>
      </nav>

      {/* Main Content Area */}
      <div className="flex-grow p-8">
        <h1 className="text-white text-3xl font-bold">{songName}</h1>
        <h2 className="text-sm text-gray-400">{artistName}</h2>

        <h2 className="text-white text-2xl font-bold mt-10 mb-10">
          Reviews for this Song
        </h2>

        {errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-400">No reviews found for this song.</p>
        ) : (
          <ul className="bg-black p-4 rounded-md w-full space-y-4">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="p-4 border border-gray-700 rounded-md text-white"
              >
                <p className="font-bold text-lg">{review.username}</p>
                <p className="text-sm text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-2">{review.reviewText}</p>
                <p className="text-white-400">Rating: {review.rating}/10</p>
                {/* Displaying likes count 
                <p className="text-gray-500 text-sm">
                  Likes: {review.likesCount || 100}
                </p>
                */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
