'use client';

import { useState, useEffect } from 'react'; // Import useState for managing state
import { useSession } from "next-auth/react";

export default function FriendPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState([]);
    const [friends, setFriends] = useState([]);

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
    

    const addFriend = async (username) => {
        try {
            const response = await fetch("/api/addFriend", {
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
                setFriends((prev) => [...prev, username]); // Add friend to the state
            } else {
                console.error("Error adding friend:", result.error);
            }
        } catch (error) {
            console.error("Error adding friend:", error);
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
                            className={`px-4 py-2 rounded ${friends.includes(user.username) ? "bg-green-500" : "bg-blue-500"} text-white`}
                            onClick={() => addFriend(user.username)}
                            disabled={friends.includes(user.username)} // Disable the button if the user is already added
                        >
                            {friends.includes(user.username) ? "Added" : "+ Add Friend"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
