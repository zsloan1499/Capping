'use client';
import Link from 'next/link';
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function UserInfo() {
    const { data: session } = useSession();
    const [error, setError] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [username, setUsername] = useState(session?.user?.username || ''); // Initial value
    const [showUsernameForm, setShowUsernameForm] = useState(false); // State to control visibility of username form

    // Deletes user account
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
                console.error("Error deleting account:", result.error);
                setError(result.error || "Error deleting account");
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    const changeUsername = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        if (!newUsername.trim()) {
            setError("Username is required."); // Check for empty username
            return;
        }

        try {
            const response = await fetch('/api/changeUsername', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: newUsername, userId: session.user.id }), // Include userId
            });

            const result = await response.json();

            if (result.usernameExists) {
                setError("Username already exists.");
            } else if (result.success) {
                console.log("Username changed successfully");
                setUsername(newUsername); // Update the local username state
                setNewUsername(""); // Clear input
                setError(""); // Clear any previous errors
                setShowUsernameForm(false); // Hide the input and button after success
            } else {
                setError(result.error || "Username change failed.");
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="bg-customBlue w-screen h-screen flex justify-center items-start p-8">
            <div className="flex">
                {/* Profile Photo and Important Details Box */}
                <div className="w-1/4">
                    <div className="flex flex-col items-center">
                        <img
                            src={session?.user?.profilePhoto || 'https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png'}
                            alt="Profile Photo"
                            className="w-48 h-48 rounded-full border-2 border-gray-500"
                        />
                        <button className="bg-gray-200 text-black p-2 rounded m-2 border border-gray-900">
                            Change Photo
                        </button>
                        {/* Placeholder for Important Dates or Additional Information */}
                        <div className="bg-black w-full mt-4 p-4 text-white text-center">
                            Important Dates or Info Here
                        </div>
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

                    {/* Username Change Form */}
                    {showUsernameForm && (
                        <form className="flex items-center mt-4" onSubmit={changeUsername}>
                            <input
                                type="text"
                                placeholder="New Username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="p-1 rounded border border-black w-1/3" // Make input smaller
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

                    <Link href="/dashboard">
                        <button className="bg-blue-500 text-white p-2 rounded m-2">
                            Go to Homepage
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
