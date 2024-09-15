'use client';

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function UserInfo() {
    const { data: session } = useSession();

    //console.log('Session data:', session);

    //console.log('Session user data:', session.user);

    return (
        <div>
            <div className="m-2">Homepage/UserInfo</div>
            <div className="m-2">First Name: <span className="font-bold m-2">{session?.user?.fName || 'N/A'}</span></div>
            <div className="m-2">Last Name: <span className="font-bold m-2">{session?.user?.lName || 'N/A'}</span></div>
            <div className="m-2">UserName: <span className="font-bold m-2">{session?.user?.username || 'N/A'}</span></div>
            <div className="m-2">Email: <span className="font-bold m-2">{session?.user?.email}</span></div>
            <button onClick={() => signOut()} className="bg-red-600 m-2">Log Out</button>
            <br />
            <button className="bg-red-600 m-2">Delete Account</button>
        </div>
    );
}
