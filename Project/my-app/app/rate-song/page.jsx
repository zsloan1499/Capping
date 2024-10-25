// app/rate-song/page.jsx
'use client'; 
import { useSession } from "next-auth/react";
import RateSong from "../components/RateSong"; // Assuming RateSong is still in components

export default function RateSongPage() {
    const { data: session } = useSession();

    return (
        <div>
            <h1>Rate a Song</h1>
            {session && session.user ? (
                <RateSong songId={"exampleSongId"} userId={session.user.id} />
            ) : (
                <p>Please log in to rate a song.</p>
            )}
        </div>
    );
}
