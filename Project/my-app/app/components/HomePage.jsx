'use client';

import { BellIcon, CogIcon } from '@heroicons/react/24/solid'; // Import Bell and Cog icons
import { useState } from 'react'; // Import useState for managing state
import Link from 'next/link';
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession(); // Get session data from NextAuth
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
          {isNavOpen ? 'Close' : 'Open'}
        </button>
        
        {/* Navigation Links */}
        {isNavOpen && (
          <>
            <Link href="/placeholder1" className="text-white p-2 hover:bg-gray-700 rounded">New Playlist/Review</Link>
            <Link href="/placeholder2" className="text-white p-2 hover:bg-gray-700 rounded">Playlists</Link>
            <Link href="/placeholder3" className="text-white p-2 hover:bg-gray-700 rounded">Reviews</Link>
            <Link href="/placeholder4" className="text-white p-2 hover:bg-gray-700 rounded">Social</Link>
            <Link href="/placeholder5" className="text-white p-2 hover:bg-gray-700 rounded">Global Ranking</Link>
          </>
        )}
      </nav>

      {/* Main Content Area */}
      <div className={`flex-grow p-8 ${isNavOpen ? 'ml-32' : 'ml-12'}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-white text-3xl font-bold">Melodi</h1>
          
          {/* Icons and Profile Photo */}
          <div className="flex items-center space-x-4">
            {/* Profile Photo */}
            <Link href="/UserInfo">
                <img src={session?.user?.profilePhoto || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"} alt="User Profile Photo" className="w-6 h-6"/>
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
      </div>
    </div>
  );
}
