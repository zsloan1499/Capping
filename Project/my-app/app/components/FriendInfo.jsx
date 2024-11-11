'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";

export default function FriendInfo() {
    const { data: session } = useSession();
    const [friendInfo, setFriendInfo] = useState({ username: '', profilePhoto: '', followerCount: 0, followingCount: 0 });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlUsername = new URLSearchParams(window.location.search).get('username');
            setUsername(urlUsername);
        }
    }, []);

    useEffect(() => {
        if (username) {
            const fetchFriendInfo = async () => {
                try {
                    const response = await fetch('/api/getFriendInfo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        setFriendInfo({
                            username: data.username,
                            profilePhoto: data.profilePhoto,
                            followerCount: data.followerCount,
                            followingCount: data.followingCount
                        });
                    } else {
                        setError(data.error || "An error occurred");
                    }
                } catch (err) {
                    console.error("Error fetching friend info:", err);
                    setError("An unexpected error occurred.");
                } finally {
                    setLoading(false);
                }
            };
            fetchFriendInfo();
        }
    }, [username]);

    useEffect(() => {
        if (session && username) {
            const checkIfFollowing = async () => {
                try {
                    const response = await fetch('/api/checkFollowing', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: session.user.id, friendUsername: username })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        setIsFollowing(data.isFollowing);
                    } else {
                        setError(data.error || "Could not check follow status");
                    }
                } catch (err) {
                    console.error("Error checking follow status:", err);
                    setError("An unexpected error occurred.");
                }
            };
            checkIfFollowing();
        }
    }, [session, username]);

    const handleFollowToggle = async () => {
        setButtonLoading(true);
        try {
            const response = await fetch('/api/toggleFollow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id, friendUsername: username })
            });
            const data = await response.json();
            if (response.ok) {
                setIsFollowing(!isFollowing);
                setFriendInfo(prevInfo => ({
                    ...prevInfo,
                    followerCount: isFollowing ? prevInfo.followerCount - 1 : prevInfo.followerCount + 1
                }));
            } else {
                setError(data.error || "Could not update follow status");
            }
        } catch (err) {
            console.error("Error toggling follow status:", err);
            setError("An unexpected error occurred.");
        } finally {
            setButtonLoading(false);
        }
    };

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <nav className={`bg-black h-full p-4 space-y-4 sticky top-0 ${isNavOpen ? 'w-48' : 'w-32'} transition-all duration-300 flex flex-col items-start`}>
                <button
                    className="bg-blue-500 text-white p-2 rounded mb-4 w-full"
                    onClick={toggleNav}
                >
                    {isNavOpen ? 'Close' : 'Open'}
                </button>

                {isNavOpen && (
                    <>
                        <Link href="/" className="text-white p-2 hover:bg-gray-700 rounded w-full">Home</Link>
                        <Link href="/placeholder1" className="text-white p-2 hover:bg-gray-700 rounded w-full">New Playlist/Review</Link>
                        <Link href="/placeholder2" className="text-white p-2 hover:bg-gray-700 rounded w-full">Playlists</Link>
                        <Link href="/rate-song" className="text-white p-2 hover:bg-gray-700 rounded w-full">Reviews</Link>
                        <Link href="/Social" className="text-white p-2 hover:bg-gray-700 rounded w-full">Social</Link>
                        <Link href="/Review" className="text-white p-2 hover:bg-gray-700 rounded w-full">Global Ranking</Link>
                    </>
                )}
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center p-4 bg-customBlue text-white">
                {loading ? (
                    <div className="text-red-500 mt-4">Loading...</div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold">{friendInfo.username}</h1>
                        {friendInfo.profilePhoto ? (
                            <img src={friendInfo.profilePhoto} alt={`${friendInfo.username}'s Profile Photo`} className="w-48 h-48 rounded-full mt-4" />
                        ) : (
                            <div className="text-red-500 mt-4">{error || "Profile photo not available."}</div>
                        )}
                        <div className="mt-4">
                            <p className="hover:underline cursor-pointer">Followers: {friendInfo.followerCount}</p>
                            <p className="hover:underline cursor-pointer">Following: {friendInfo.followingCount}</p>
                        </div>
                        <button
                            onClick={handleFollowToggle}
                            disabled={buttonLoading}
                            className={`mt-4 px-4 py-2 rounded ${isFollowing ? 'bg-red-500' : 'bg-green-500'}`}
                        >
                            {buttonLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
