'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

export default function FriendPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState([]);         // List of users available to follow
    const [following, setFollowing] = useState([]); // List of users the current user is following

    useEffect(() => {
        if (session?.user) {
            const fetchUsers = async () => {
                try {
                    const response = await fetch('/api/getfriendList', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: session.user.id }),  // Send the userId in the body
                    });
    
                    const result = await response.json();
    
                    if (response.ok) {
                        setUsers(result);  // Set users available to follow
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
                    userId: session.user.id, // Send current user's ID
                    friendUsername: username  // Send the friend's username
                })
            });
    
            const result = await response.json();
    
            if (response.ok) {
                setFollowing((prev) => [...prev, username]); // Add user to the following list in state
            } else {
                console.error("Error adding follower:", result.error);
            }
        } catch (error) {
            console.error("Error following user:", error);
        }
    };
    

    return (
        <div className="w-full h-screen p-8 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Add Friends</h1>
            <div className="space-y-4">
                {users.map((user) => (
                    <div key={user.username} className="flex justify-between items-center p-4 bg-white shadow rounded-lg">
                        <span>{user.username}</span>
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
    );
}
