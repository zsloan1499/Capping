'use client';
import Link from 'next/link';
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function UserInfo() {
    const { data: session } = useSession();
    const [error, setError] = useState("");

    //deletes user account
    const deleteAccount = async () => {
        if (!session?.user?.email) {
            setError(" email not found.");
            return;
        }
        
        // uses the email from the current session
        const userEmail = session.user.email;

        try {
            //calls the delete api
            const response = await fetch('/api/deleteaccount', {
                //post used as we are sending data to the back
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userEmail }),
            });

            const result = await response.json();

            //if good we sign out and send back to login page
            if (response.ok) {
                console.log("Account deleted successfully:", result);
                signOut(); // signs the user out
                router.replace("/"); //back to login page
            } else {
                console.error("Error deleting account:", result.error);
                setError(result.error || "Error deleting account");
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div>
            <div className="m-2">Homepage/UserInfo</div>
            <div className="m-2">First Name: <span className="font-bold m-2">{session?.user?.fName || 'N/A'}</span></div>
            <div className="m-2">Last Name: <span className="font-bold m-2">{session?.user?.lName || 'N/A'}</span></div>
            <div className="m-2">UserName: <span className="font-bold m-2">{session?.user?.username || 'N/A'}</span></div>
            <div className="m-2">Email: <span className="font-bold m-2">{session?.user?.email}</span></div>
            <button className=" m-2 border border-2 border-gray-900">Add Photo</button> <br />

            {/* signs user out */}
            <button onClick={() => signOut()} className="bg-red-600 m-2">Log Out</button>

            <br />
            {/* when clicked it calls the delete user */}
            <button onClick ={() => deleteAccount()} className="bg-red-600 m-2">Delete Account</button>
            {error && <div className="text-red-500 m-2">{error}</div>}
            {/* Button that navigates to /new-page */}
            <Link href="/dashboard">
                <button className="bg-blue-500 text-white p-2 rounded">
                    Go to Homepage
                </button>
            </Link>
        </div>
    );
}
