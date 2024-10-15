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
    width: '100%',  // Ensure each item takes up full width of the carousel container
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px', // Example height, adjust as needed
    backgroundColor: '#f0f0f0', // Example background color
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

  return (
    <div className="bg-customBlue w-screen h-screen flex overflow-x-hidden">
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
            <Link href="/Social" className="text-white p-2 hover:bg-gray-700 rounded">Social</Link>
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

        {/* Carousel Section - Your Top Artists */}
        <div style={carouselContainerStyle} className="w-full">
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

        {/* Carousel Section - Your Playlists */}
        <div style={carouselContainerStyle} className="w-full">
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

        {/* Carousel Section - Friends */}
        <div style={carouselContainerStyle} className="w-full">
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

        {/* Carousel Section - Reviews*/}
        <div style={carouselContainerStyle} className="w-full">
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
