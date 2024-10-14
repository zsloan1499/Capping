'use client';

import { BellIcon, CogIcon } from '@heroicons/react/24/solid'; // Import Bell and Cog icons
import { useState } from 'react'; // Import useState for managing state
import Link from 'next/link';
import { useSession } from "next-auth/react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

export default function HomePage() {
  const { data: session } = useSession(); 
  const [isNavOpen, setIsNavOpen] = useState(false);
  const itemStyle = {
    width: '0 0 200px',
    height: '150px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ccc',
    margin: '0 5px', 
    boxSizing: 'border-box', 
  };

  const carouselContainerStyle = {
    maxWidth: '100%', 
    overflow: 'hidden', 
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

  return (
    <div className="bg-customBlue w-screen h-screen flex">
      {/* Left Side Navigation Bar */}
      <nav className={`bg-black ${isNavOpen ? 'w-42' : 'w-42'} h-full p-4 flex flex-col space-y-4 transition-width duration-300`}>
        {/* Button to open/close the navigation */}
        <button
          className="bg-blue-500 text-white p-2 rounded mb-4 w-16"
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
      <title>Melodi</title>
      <div className={`flex-grow p-8 ${isNavOpen ? 'ml-32' : 'ml-12'}`}>
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
        <div style={carouselContainerStyle} className='w-full'>
          <Carousel responsive={responsive} arrows={true}>
            <div style={itemStyle}>Item 1</div>
            <div style={itemStyle}>Item 2</div>
            <div style={itemStyle}>Item 3</div>
            <div style={itemStyle}>Item 4</div>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
