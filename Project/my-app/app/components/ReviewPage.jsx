'use client'
import { BellIcon, CogIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import "react-multi-carousel/lib/styles.css";
import { Editor, EditorState, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";

export default function HomePage() {
  const { data: session } = useSession(); 
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  
  const charLimit = 250;

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleNumberChange = (event) => {
    setSelectedNumber(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchItem(event.target.value);
  };

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

    const reviewText = editorState.getCurrentContent().getPlainText(); // Get the review text
    const userId = session?.user?.id; // Retrieve user ID from session

    // Validate the presence of required fields
    if (!searchItem || !selectedNumber || !reviewText || !userId) {
        console.error("All fields are required!");
        return;
    }

    try {
        const response = await fetch('/api/addReview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                searchItem,
                selectedNumber,
                reviewText,
                userId, // Include user ID in the request
            }),
        });

        const data = await response.json();
        console.log("Submitted data:", data);

        // Optionally reset the form fields after submission
        setSearchItem('');
        setSelectedNumber('');
        setEditorState(EditorState.createEmpty());
    } catch (error) {
        console.error("Error submitting review:", error);
    }
};


  return (
    <div className="bg-customBlue w-screen h-screen flex overflow-x-hidden">
      {/* Left Side Navigation Bar */}
      <nav className={`bg-black ${isNavOpen ? 'w-42' : 'w-42'} h-full p-4 flex flex-col space-y-4 transition-width duration-300`}>
        <button
          className="bg-blue-500 text-white p-2 rounded mb-4 w-16"
          onClick={toggleNav}
        >
          {isNavOpen ? 'Close' : 'Open'}
        </button>

        {isNavOpen && (
          <>
            <Link href="/" className="text-white p-2 hover:bg-gray-700 rounded">Homepage</Link>
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
          <h1 className="text-white text-3xl font-bold">Review a Song</h1>

          <div className="flex items-center space-x-4">
            <Link href="/UserInfo">
              <img src={session?.user?.profilePhoto || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"} alt="User Profile Photo" className="w-6 h-6" />
            </Link>
            <button className="text-white relative">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"></span>
            </button>
            <button className="text-white">
              <CogIcon className="w-6 h-6" />
            </button>
          </div>
        </div> 
        <br />

        {/* Bordered Container for Inputs and Review Box */}
        <form onSubmit={handleFormSubmit} className="border border-gray-600 p-6 rounded-lg bg-gray-800 mt-6">
          <label className="text-white">Search for a Song:</label>
          <input 
            id="search" 
            type="text" 
            value={searchItem} 
            onChange={handleSearchChange} 
            placeholder="Search for a Song" 
            className="ml-2 p-2 rounded bg-gray-900 text-white border border-gray-600"
          />

          <label className="text-white ml-5 mr-3">Select a Number:</label>
          <select 
            id="numberSelect" 
            value={selectedNumber} 
            onChange={handleNumberChange} 
            className="p-2 rounded bg-gray-900 text-white border border-gray-600"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>

          {/* Review Box (Draft.js Editor) */}
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
            <div className="text-gray-400 text-sm mt-2">
              {editorState.getCurrentContent().getPlainText().length}/{charLimit} characters
            </div>
          </div>
          
          <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
