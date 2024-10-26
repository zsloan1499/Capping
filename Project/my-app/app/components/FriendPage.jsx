'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { BellIcon, CogIcon } from '@heroicons/react/24/solid';

export default function FriendPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isNavOpen, setIsNavOpen] = useState(false);

    useEffect(() => {
        if (session?.user) {
            const fetchUsers = async () => {
                try {
                    const response = await fetch('/api/getfriendList', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: session.user.id }),
                    });

                    const result = await response.json();

                    if (response.ok) {
                        setUsers(result);
                    } else {
                        console.error("Error fetching users", result.error);
                    }
                } catch (error) {
                    console.error("An unexpected error occurred:", error);
                }
            };
            fetchUsers();
        }
    }, [session]);

    const addFollowing = async (username) => {
        try {
            const response = await fetch("/api/addFollower", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    friendUsername: username
                })
            });

            const result = await response.json();

            if (response.ok) {
                setFollowing((prev) => [...prev, username]);
            } else {
                console.error("Error adding follower:", result.error);
            }
        } catch (error) {
            console.error("Error following user:", error);
        }
    };

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <div className="w-screen h-screen flex bg-customBlue">
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
                        <Link href="/" className="text-white p-2 hover:bg-gray-700 rounded">Home</Link>
                        <Link href="/placeholder1" className="text-white p-2 hover:bg-gray-700 rounded">New Playlist/Review</Link>
                        <Link href="/placeholder2" className="text-white p-2 hover:bg-gray-700 rounded">Playlists</Link>
                        <Link href="/rate-song" className="text-white p-2 hover:bg-gray-700 rounded">Reviews</Link>
                        <Link href="/Social" className="text-white p-2 hover:bg-gray-700 rounded">Social</Link>
                        <Link href="/placeholder5" className="text-white p-2 hover:bg-gray-700 rounded">Global Ranking</Link>
                    </>
                )}
            </nav>

            {/* Main Content Area */}
            <div className={`flex-grow p-8 ${isNavOpen ? 'ml-32' : 'ml-12'}`}>
                <div className="flex items-center justify-between">
                    <h1 className="text-white text-2xl font-bold mb-4">Add Friends</h1>
                    
                    {/* Icons and Profile Photo */}
                    <div className="flex items-center space-x-4">
                        <Link href="/UserInfo">
                            <img src={session?.user?.profilePhoto || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"} alt="User Profile Photo" className="w-6 h-6" />
                        </Link>

                        <button className="text-white relative">
                            <BellIcon className="w-6 h-6" />
                            <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {/* Optional notification content */}
                            </span>
                        </button>

                        <button className="text-white">
                            <CogIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user.username} className="flex justify-between items-center p-4 bg-customBlue2 shadow rounded-lg">
                            <Link 
                                href={`/FriendInfo?username=${user.username}`} // Pass username directly as query param
                                className="text-white"
                            >
                                <span className="text-white">{user.username}</span>
                            </Link>     
                            <button
                                className={`px-4 py-2 rounded ${following.includes(user.username) ? "bg-green-500" : "bg-blue-500"} text-white`}
                                onClick={() => addFollowing(user.username)}
                                disabled={following.includes(user.username)} // Disable the button if the user is already added
                            >
                                {following.includes(user.username) ? "Added" : "+ Add Friend"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
