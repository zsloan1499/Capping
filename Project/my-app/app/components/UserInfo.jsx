'use client';
import Link from 'next/link';
import { signOut, signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function UserInfo() {
    const { data: session } = useSession();
    const [error, setError] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [username, setUsername] = useState(session?.user?.username || '');
    const [showUsernameForm, setShowUsernameForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState("");
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [showFollowingBox, setShowFollowingBox] = useState(false);
    const [showFollowerBox, setShowFollowerBox] = useState(false);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isNavOpen, setIsNavOpen] = useState(false);


    // Debugging log to check the URL
    console.log("Profile Photo URL:", profilePhoto);

    useEffect(() => {
        if (session?.user?.username) {
            // Fetch follower count
            fetch('/api/getFollowerCount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: session.user.username })
            })
                .then(res => res.json())
                .then(data => setFollowerCount(data.followerCount || 0))
                .catch(err => console.error("Error fetching follower count:", err));

            // Fetch following count
            fetch('/api/getFollowingCount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: session.user.username })
            })
                .then(res => res.json())
                .then(data => setFollowingCount(data.followingCount || 0))
                .catch(err => console.error("Error fetching following count:", err));
        }
    }, [session?.user?.username]);


    // Handle Spotify access token (unchanged)
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get("code");
        //const code = "AQCf8_nBpVFoVnoeGliCNiBmAsH7nNFPjqae1pybKJ9lEWLned7gQUy2ieVZ8765d1FBynsQIsJmMQw_OSE5NeUqu2BqKvtsy4P3kQsjXjLo4Muc92MMwxALm4YYSfEzfHnRW6G1z2Kt29JcJVkQ9Hvr8UvYWWoOgvtuhiwDheByyHQHZnrUDgDExxrE2yJxQo4sjU18pZklt_IPN8Ne2kamMSKKDmO-fJ6yK7r0pfm6DEbIk0nDKlHu"; 
        if (code) {
            exchangeCodeForToken(code);
        }
    }, []);

    //exchange code in url for Spotify Token 
    const exchangeCodeForToken = async (code) => {
        try {
            const response = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + btoa(process.env.NEXT_PUBLIC_S_CLIENT_ID + ":" + process.env.NEXT_PUBLIC_S_CLIENT_SECRET)
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: process.env.NEXT_PUBLIC_S_REDIRECT_URI,
                    client_id: process.env.NEXT_PUBLIC_S_CLIENT_ID,
                    client_secret: process.env.NEXT_PUBLIC_S_CLIENT_SECRET,
                })
            });

            const data = await response.json();

            if (response.ok && data.access_token) {
                console.log("Access Token:", data.access_token);
                sessionStorage.setItem("spotifyAccessToken", data.access_token); //store spotify access token
                //localStorage.setItem("spotifyAccessToken1", data.access_token); //tried using localStorage 
                await getSpotifyUserProfile(data.access_token);
            } else {
                console.error("Error exchanging code for token:", data.error);
            }
        } catch (error) {
            console.error("Error exchanging code for token:", error);
        }
    };

    const getSpotifyUserProfile = async (accessToken) => {
        try {
            const response = await fetch("https://api.spotify.com/v1/me", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                console.log("User Profile Data:", userData);
            } else {
                console.error("Error fetching user profile:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const handleSpotifyLogin = async () => {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.NEXT_PUBLIC_S_CLIENT_ID,
            redirect_uri: process.env.NEXT_PUBLIC_S_REDIRECT_URI,
            scope: "user-read-email playlist-read-private user-top-read user-read-recently-played" //user-top-read = users top songs, 
        });
        const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' + params.toString();
        window.location.href = spotifyAuthUrl;
    };

    // Deletes user account (unchanged)
    const deleteAccount = async () => {
        if (!session?.user?.email) {
            setError("Email not found.");
            return;
        }

        const userEmail = session.user.email;

        try {
            const response = await fetch('/api/deleteaccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userEmail }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Account deleted successfully:", result);
                signOut({ callbackUrl: '/' });
            } else {
                setError(result.error || "Error deleting account");
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    // Change username
    const changeUsername = async (e) => {
        e.preventDefault();

        // Check for empty username
        if (!newUsername.trim()) {
            setError("Username is required.");
            return;
        }

        try {
            const response = await fetch('/api/changeUsername', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: newUsername, userId: session.user.id }),
            });

            const result = await response.json();

            // Handle username existence and success response
            if (result.usernameExists) {
                setError("Username already exists.");
            } else if (result.success) {
                setUsername(newUsername); // Update local state with new username
                setNewUsername("");
                setError("");
                setShowUsernameForm(false);

                // Step 1: Sign out the user
                await signOut({ redirect: false }); // Prevent redirect to the login page

                // Optional: Add a short delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 2: Prompt user for password
                const password = prompt("Please enter your password to sign back in:");

                // Check if password was provided
                if (!password) {
                    setError("Password is required to sign back in.");
                    return;
                }

                // Sign in the user again with credentials to refresh session data
                const updatedSession = await signIn("credentials", {
                    email: session.user.email,
                    password: password, // Use the provided password
                    redirect: false // Prevent redirect after sign in
                });

                if (updatedSession.error) {
                    console.error("Sign-in error:", updatedSession.error); // Log the specific error
                    setError("Error signing back in. Please try again.");
                }
            } else {
                setError(result.error || "Username change failed.");
            }
        } catch (error) {
            console.error("Unexpected error:", error); // Log unexpected errors
            setError("An unexpected error occurred. Please try again.");
        }
    };

    // Change profile photo
    const handlePhotoChange = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setError("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("/api/uploadProfilePhoto", {
                method: "POST",
                body: formData, // Send the file as form-data
            });

            const result = await response.json();

            // After updating the profile photo
            if (result.success) {
                // Step 2: Update MongoDB with the new profile photo URL
                const updateResponse = await fetch('/api/updateProfilePhoto', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: session.user.id, profilePhotoUrl: result.profilePhotoUrl }),
                });

                const updateResult = await updateResponse.json();

                if (!updateResult.success) {
                    setError(updateResult.error || "Failed to update profile photo in the database.");
                    return;
                }

                setProfilePhoto(result.profilePhotoUrl); // Update the local state with the new profile photo URL
                setError(""); // Clear any errors if the update was successful

                // Step 3: Sign out the user
                await signOut({ redirect: false }); // Prevent redirect to the login page

                // Optional: Add a short delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 4: Prompt user for password
                const password = prompt("Please enter your password to sign back in:");

                // Check if password was provided
                if (!password) {
                    setError("Password is required to sign back in.");
                    return;
                }

                // Sign in the user again with credentials to refresh session data
                const updatedSession = await signIn("credentials", {
                    email: session.user.email,
                    password: password, // Use the provided password
                    redirect: false // Prevent redirect after sign in
                });

                if (updatedSession.error) {
                    console.error("Sign-in error:", updatedSession.error); // Log the specific error
                    setError("Error signing back in. Please try again.");
                }
            } else {
                setError(result.error || "Failed to update profile photo.");
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    // Toggle follower box and fetch data if opening
    const toggleFollowerBox = async () => {
        if (!showFollowerBox) {
            // Fetch followers only if the box is about to be shown
            await fetchFollowers();
        }
        setShowFollowerBox(!showFollowerBox);
    };

    // Toggle following box and fetch data if opening
    const toggleFollowingBox = async () => {
        if (!showFollowingBox) {
            // Fetch following only if the box is about to be shown
            await fetchFollowing();
        }
        setShowFollowingBox(!showFollowingBox);
    };

    // Fetch followers from API
    const fetchFollowers = async () => {
        try {
            console.log("Fetching followers for:", session.user.username);
            const response = await fetch('/api/getFollowers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: session.user.username })
            });

            const data = await response.json();
            console.log("Fetched followers:", data.followers); // Log the followers data
            setFollowers(data.followers || []); // Set followers in state
        } catch (error) {
            console.error("Error fetching followers:", error);
        }
    };



    // Fetch following from API
    const fetchFollowing = async () => {
        try {
            const response = await fetch('/api/getFollowing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await response.json();
            setFollowing(data.following || []);
        } catch (error) {
            console.error("Error fetching following:", error);
        }
    };

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    const removeFollower = async (followerId) => {
        try {
            const response = await fetch('/api/removeFollower', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    followerId: followerId,
                    userId: session.user.id, // Make sure session.user.id is a valid MongoDB ObjectId string
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setFollowers((prevFollowers) =>
                    prevFollowers.filter((follower) => follower._id !== followerId)
                );
                setFollowerCount(followerCount - 1); // Update follower count
            } else {
                console.error("Failed to remove follower:", result);
                setError(result.error || "Error removing follower.");
            }
        } catch (error) {
            console.error("Error removing follower:", error);
            setError("An unexpected error occurred. Please try again.");
        }
    };


    const removeFollowing = async (followingId) => {
        try {
            const response = await fetch('/api/removeFollowing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    followingId: followingId,
                    userId: session.user.id, // Make sure session.user.id is a valid MongoDB ObjectId string
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setFollowing((prevFollowing) =>
                    prevFollowing.filter((following) => following._id !== followingId)
                );
                setFollowingCount(followingCount - 1); // Update following count
            } else {
                console.error("Failed to remove following:", result);
                setError(result.error || "Error removing following.");
            }
        } catch (error) {
            console.error("Error removing following:", error);
            setError("An unexpected error occurred. Please try again.");
        }
    };



    return (
        <div className="bg-customBlue w-screen h-screen flex">
            {/* Navigation on the left side */}
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

            <div className="flex flex-col w-full">
                <title>Melodi</title>

                <div className="flex">
                    {/* Profile Photo and Important Details Box */}
                    <div className="w-1/4">
                        <div className="flex flex-col items-center">
                            <img
                                src={session?.user?.profilePhoto}
                                alt="Profile Photo"
                                className="w-48 h-48 rounded-full border-2 border-gray-500"
                            />
                            <form onSubmit={handlePhotoChange}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="mt-2"
                                />
                                <button type="submit" className="bg-gray-200 text-black p-2 rounded m-2 border border-gray-900">
                                    Change Photo
                                </button>
                            </form>
                            {error && <div className="text-red-500 mt-2">{error}</div>}
                            <button onClick={toggleFollowerBox}>
                                <p className="hover:underline cursor-pointer m-1 text-white">Followers: {followerCount}</p>
                            </button>
                            <button onClick={toggleFollowingBox}>
                                <p className="hover:underline cursor-pointer m-1 text-white">Following: {followingCount}</p>
                            </button>
                        </div>
                    </div>

                    {/* User Info Section */}
                    <div className="w-3/4 bg-customBlue border-5 border-gray-500 p-8 rounded-lg ml-8">
                        <div className="text-white text-xl mb-4">User Info</div>
                        <div className="text-white text-lg m-2">
                            First Name: <span className="font-bold">{session?.user?.fName || 'N/A'}</span>
                        </div>
                        <div className="text-white text-lg m-2">
                            Last Name: <span className="font-bold">{session?.user?.lName || 'N/A'}</span>
                        </div>
                        <div className="text-white text-lg m-2">
                            UserName: <span className="font-bold">{session?.user?.username || 'N/A'}</span>
                            <button
                                onClick={() => setShowUsernameForm(!showUsernameForm)}
                                className="ml-2 text-gray-200">
                                Edit
                            </button>
                        </div>
                        {showUsernameForm && (
                            <form className="flex items-center mt-4" onSubmit={changeUsername}>
                                <input
                                    type="text"
                                    placeholder="New Username"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="p-1 rounded border border-black w-1/3"
                                />
                                <button type="submit" className="bg-customBlue text-white p-1 rounded ml-2 border border-black">
                                    Change Username
                                </button>
                            </form>
                        )}
                        {error && <div className="text-red-500 mt-2">{error}</div>}

                        <div className="text-white text-lg m-2">
                            Password: <span className="font-bold">••••••</span>
                        </div>

                        <button onClick={() => signOut({ callbackUrl: '/' })} className="bg-red-600 text-white p-2 rounded m-2">
                            Log Out
                        </button>

                        <button onClick={deleteAccount} className="bg-red-600 text-white p-2 rounded m-2">
                            Delete Account
                        </button>

                        {/* Spotify Login Button */}
                        <button onClick={handleSpotifyLogin} className="bg-green-600 text-white w-full p-2 rounded m-2">
                            Login with Spotify
                        </button>

                        <Link href="/dashboard">
                            <button className="bg-blue-500 text-white p-2 rounded m-2">
                                Go to Homepage
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Follower Pop-Up Box */}
                {showFollowerBox && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-8 rounded-lg w-1/2">
                            <h2 className="text-2xl font-bold mb-4">Followers</h2>
                            <button onClick={toggleFollowerBox} className="text-red-500 mb-2">Close</button>
                            <input type="text" placeholder="Search" className="p-2 border rounded w-full" />
                            <ul className="mt-4">
                                {followers.map(follower => (
                                    <li key={follower._id} className="p-2 border-b flex items-center">
                                        <img src={follower.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full mr-2" />
                                        <p className="text-lg">{follower.username}</p>
                                        <button
                                            onClick={() => removeFollower(follower._id)} // Remove follower when clicked
                                            className="ml-auto bg-red-500 text-white p-1 rounded"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Following Pop-Up Box */}
                {showFollowingBox && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-8 rounded-lg w-1/2">
                            <h2 className="text-2xl font-bold mb-4">Following</h2>
                            <button onClick={toggleFollowingBox} className="text-red-500 mb-2">Close</button>
                            <input type="text" placeholder="Search" className="p-2 border rounded w-full" />
                            <ul className="mt-4">
                                {following.map(friend => (
                                    <li key={friend._id} className="p-2 border-b flex items-center">
                                        <img src={friend.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full mr-2" />
                                        {friend.username}
                                        <button
                                            onClick={() => removeFollowing(friend._id)} // Remove following when clicked
                                            className="ml-auto bg-red-500 text-white p-1 rounded"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

            </div>
        </div>

    );
}