'use client';
import Link from 'next/link';
import { signOut, signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FaThumbsUp } from 'react-icons/fa';

export default function UserInfo() {
    const { data: session } = useSession();
    const [error, setError] = useState("");
    const [errorPhoto, setErrorPhoto] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [showUsernameForm, setShowUsernameForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [showFollowingBox, setShowFollowingBox] = useState(false);
    const [showFollowerBox, setShowFollowerBox] = useState(false);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewCount, setReviewCount] = useState(0);
    const [username, setUsername] = useState('');
    const [profilePhoto, setprofilePhoto] = useState('');
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [likedReviews, setLikedReviews] = useState({}); 


    // Get the username from session on mount
    useEffect(() => {
        const fetchUsername = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch('/api/getUsername', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: session.user.id }), // Pass the user ID
                    });

                    const data = await response.json();

                    if (data.username) {
                        setUsername(data.username); // Set the username from the database
                    } else {
                        setUsername('No username found');
                    }
                } catch (error) {
                    console.error("Error fetching username:", error);
                    setUsername('Error fetching username');
                } finally {
                    setLoading(false);
                }
            }
        };

        // Only call the fetch function if session is available
        if (session) {
            fetchUsername();
        }
    }, [session]); // Runs when the session changes


    useEffect(() => {
        const fetchProfilePhoto = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch('/api/getProfilePhoto', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: session.user.id }), // Pass the user ID
                    });
    
                    const data = await response.json();
    
                    if (data.profilePhoto) {
                        setprofilePhoto(data.profilePhoto); // Set the profile photo URL from the database
                    } else {
                        setprofilePhoto(''); // Set to a default image if none found
                    }
                } catch (error) {
                    console.error("Error fetching profile photo:", error);
                    setprofilePhoto('/defaultPhoto.png'); // Set to a default image on error
                } finally {
                    setLoading(false);
                }
            }
        };
    
        // Only call the fetch function if session is available
        if (session) {
            fetchProfilePhoto();
        }
    }, [session]); // Runs when the session changes
    




    useEffect(() => {
        if (session?.user?.username) {
            // Fetch follower count
            fetch('/api/getFollowerCount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({  userId: session.user.id  })
            })
                .then(res => res.json())
                .then(data => setFollowerCount(data.followerCount || 0))
                .catch(err => console.error("Error fetching follower count:", err));

            // Fetch following count
            fetch('/api/getFollowingCount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({  userId: session.user.id  })
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

    useEffect(() => {
        if (session?.user?.id) {
            const fetchReviews = async () => {
                try {
                    const response = await fetch('/api/getUserReviews', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: session.user.id }),
                    });
    
                    const data = await response.json();
                    console.log("Fetched reviews:", data.reviews); // Check the structure of the response
                    if (response.ok) {
                        setReviews(data.reviews || []);  // Store the reviews including reviewId
                    } else {
                        setError('');
                    }
                } catch (error) {
                    console.error("Error fetching reviews:", error);
                    setError('Error fetching reviews');
                }
            };
    
            fetchReviews();
        }
    }, [session?.user?.id]);
    



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
            scope: "user-read-email playlist-read-private user-top-read user-read-recently-played playlist-read-private playlist-read-collaborative" //user-top-read = users top songs, 
        });
        const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' + params.toString();
        window.location.href = spotifyAuthUrl;
    };

    const deleteAccountPopUp = () => {
        setShowDeletePopup(true); 
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
    
                // Step 1: Update session without signing out
                console.log("Updating session with new username...");
    
                // Update session state with new username (without requiring re-login)
                const updatedSession = { ...session, user: { ...session.user, username: newUsername } };
    
                // Optionally, you can use next-auth's `setSession` method if available
                // Example: `setSession(updatedSession);` (if `setSession` is available)
    
                // If you're using next-auth, you can refresh the session like this:
                await fetch('/api/auth/session', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                // Step 2: Fetch reviews immediately
                const fetchReviews = async () => {
                    try {
                        const reviewResponse = await fetch('/api/getUserReviews', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: session.user.id }),
                        });
    
                        const data = await reviewResponse.json();
    
                        if (reviewResponse.ok) {
                            setReviews(data.reviews || []);
                            setReviewCount(data.reviewCount || 0);
                            setAverageRating(data.averageRating || 0);
                        } else {
                            setError('Failed to load reviews');
                        }
                    } catch (error) {
                        console.error("Error fetching reviews:", error);
                    }
                };
    
                await fetchReviews();
    
                console.log("Username and reviews updated successfully!");
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
            setErrorPhoto("Please select a file.");
            return;
        }
    
        const formData = new FormData();
        formData.append("file", selectedFile);
    
        try {
            // Step 1: Upload the photo file
            const response = await fetch("/api/uploadProfilePhoto", {
                method: "POST",
                body: formData, // Send the file as form-data
            });
    
            const result = await response.json();
    
            // After successfully uploading the profile photo
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
                    setErrorPhoto(updateResult.error || "Failed to update profile photo in the database.");
                    return;
                }
    
                // Step 3: Update local state with the new profile photo URL
                setprofilePhoto(result.profilePhotoUrl);
                setErrorPhoto(""); // Clear any errors if the update was successful
    
            } else {
                setErrorPhoto(result.error || "Failed to update profile photo.");
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            setErrorPhoto("An unexpected error occurred. Please try again.");
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
            console.log("Fetching followers for:", session.user.id); // Log userId instead of username
            const response = await fetch('/api/getFollowers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id }) // Send userId in request body
            });
    
            const data = await response.json();
            console.log("Fetched followers:", data.followers); // Log followers array
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
                body: JSON.stringify({ userId: session.user.id })  // Use userId instead of username
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
        console.log("Attempting to remove following with ID:", followingId); // Debug log
    
        if (!followingId) {
            console.error("Invalid followingId:", followingId);
            return;
        }
    
        try {
            const response = await fetch('/api/removeFollowing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    followingId: followingId,
                    userId: session.user.id, // Ensure session.user.id is valid MongoDB ObjectId string
                }),
            });
    
            const result = await response.json();
            console.log("Response from server:", result); // Log server response
    
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

    const deleteReview = async (reviewId) => {
        console.log('Attempting to delete review with ID:', reviewId); // Log reviewId
    
        if (!reviewId) {
            console.error('Invalid reviewId:', reviewId);
            return;
        }
    
        try {
            const response = await fetch('/api/deleteReview', {
                method: 'DELETE', // Ensure DELETE method is used
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reviewId: reviewId,  // Pass the reviewId
                    userId: session.user.id, // Ensure session.user.id is valid
                }),
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log('Review deleted successfully:', data.message);
                setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));  // Remove review from local state
            } else {
                console.error('Failed to delete review:', data.error);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };
    
    
    
      


    


    return (
        <div className="bg-customBlue w-screen h-screen flex overflow-y-auto">
            {/* Popup for Account Deletion Confirmation */}
            {showDeletePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-80 text-center shadow-lg">
                        <h2 className="text-lg font-bold mb-4">Confirm Account Deletion</h2>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete your account? The account will be deleted permanenly and cannot be recovered.</p>
                        <div className="flex justify-around">
                            <button 
                                onClick={deleteAccount}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                                Delete Account
                            </button>
                            <button 
                                onClick={() => setShowDeletePopup(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Navigation on the left side */}
            <nav className={`bg-black ${isNavOpen ? 'w-42' : 'w-42'} sticky top-0 h-auto p-4 flex flex-col space-y-4 transition-width duration-300`}>
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
            
    
            <div className="flex flex-col w-full">
                <title>Melodi</title>
    
                <div className="flex">
                    {/* Profile Photo and Important Details Box */}
                    <div className="w-1/4">
                        <div className="flex flex-col items-center">
                            <img
                                src={profilePhoto}
                                alt="Profile Photo"
                                className="w-48 h-48 rounded-full border-2 border-gray-500"
                            />
                            
                            {/* Photo Change Section */}
                            <form onSubmit={handlePhotoChange} className="flex flex-col items-center mt-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="mt-2"
                                />
                                {/* Displaying "No file chosen" when no file is selected */}
                                <p className="text-sm text-gray-500 mt-2">
                                    {selectedFile ? selectedFile.name : "No file chosen"}
                                </p>
                                
                                <button
                                    type="submit"
                                    className="bg-gray-200 text-black p-2 rounded m-2 border border-gray-900 mt-4"
                                >
                                    Change Photo
                                </button>
                            </form>
    
                            {errorPhoto && <div className="text-red-500 mt-2">{errorPhoto}</div>}
    
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
                            UserName: <span className="font-bold">{username || 'N/A'}</span>
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
    
                        {/* Spotify Login Button */}
                        <button onClick={handleSpotifyLogin} className="bg-green-600 text-white w-52 p-2 rounded m-2">
                            Login with Spotify
                        </button>
                        <br></br>
    
                        <button onClick={() => signOut({ callbackUrl: '/' })} className="bg-red-600 text-white p-2 rounded m-2">
                            Log Out
                        </button>
    
                        <button onClick={deleteAccountPopUp} className="bg-red-600 text-white p-2 rounded m-2">
                            Delete Account
                        </button>
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
                                        <Link 
                                            href={`/FriendInfo?username=${follower.username}`} 
                                            className=" hover:underline"
                                        >
                                            <span>{follower.username}</span>
                                        </Link>
                                        <button
                                            onClick={() => removeFollower(follower._id)} 
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
                                        <Link 
                                            href={`/FriendInfo?username=${friend.username}`} // Link to FriendInfo with username
                                            className=" hover:underline"
                                        >
                                            <span>{friend.username}</span>
                                        </Link>
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
    
                {/* Reviews Section */}
                <div className="mt-8 px-8 w-full">
            <h2 className="text-2xl text-white mb-6">{`Reviews (${reviews.length})`}</h2>
            <div className="space-y-8">
            {reviews.map((review) => {
  console.log("Review object", review);  // Log the review object itself
  return (
    <div key={review.id || 'missing-id'} className="bg-opacity-50 bg-gray-800 text-white p-6 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-lg font-semibold">{review.username}</p>
          <p className="text-md italic">{review.songName} by <span className="font-bold">{review.songArtist}</span></p>
        </div>
        <p className="text-lg font-semibold text-right">Rating: {review.rating}</p>
      </div>

      <p className="text-lg mt-4">{review.reviewText}</p>

      {/* Like and Delete Buttons Section */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center">
          <FaThumbsUp />
          <span className="ml-5">{review.likes || 0}</span>
        </div>

        {/* Delete Review Button */}
        <button
          onClick={() => {
            console.log("Review ID on Delete button click:", review.id);  // Log ID here as well
            if (review.id) {
              deleteReview(review.id);  // Ensure review.id is passed to deleteReview
            } else {
              console.error('Review ID is missing');
            }
          }}
          className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
})}




                    </div>
                </div>
    
                {/* Error Display */}
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        </div>
    );
    
    
}