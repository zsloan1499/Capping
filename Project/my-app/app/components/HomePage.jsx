'use client'

import { useState } from 'react'; // Import useState for managing state
import Link from 'next/link';

export default function HomePage() {
  const [isNavOpen, setIsNavOpen] = useState(false); // State to manage navigation visibility

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen); // Toggle the navigation state
  };

  return (
    <div className="bg-customBlue w-screen h-screen flex">
      {/* Left Side Navigation Bar */}
      <nav className={`bg-black ${isNavOpen ? 'w-32' : 'w-12'} h-full p-4 flex flex-col space-y-4 transition-width duration-300`}>
        {/* Button to open/close the navigation */}
        <button 
          className="bg-blue-500 text-white p-2 rounded mb-4" 
          onClick={toggleNav}
        >
          {isNavOpen ? 'Close ' : 'Open '}
        </button>
        
        {/* Navigation Links */}
        {isNavOpen && (
          <>
            <Link href="/placeholder1" className="text-white p-2 hover:bg-gray-700 rounded">New Playlist</Link>
            <Link href="/placeholder2" className="text-white p-2 hover:bg-gray-700 rounded">Playlists</Link>
            <Link href="/placeholder3" className="text-white p-2 hover:bg-gray-700 rounded">Reviews</Link>
            <Link href="/placeholder4" className="text-white p-2 hover:bg-gray-700 rounded">Social</Link>
            <Link href="/placeholder5" className="text-white p-2 hover:bg-gray-700 rounded">Global Ranking</Link>
          </>
        )}
      </nav>

      {/* Main Content Area */}
      <div className={`flex-grow p-8 ${isNavOpen ? 'ml-32' : 'ml-12'}`}>
        <div>
          <h1 className="text-white text-3xl font-bold">Melodi</h1>
        </div>
        {/* Button that navigates to /UserInfo */}
        <Link href="/UserInfo" className="bg-blue-500 text-white p-2 rounded mt-4 inline-block"> Go to Profile Info </Link>
      </div>
    </div>
  );
}
