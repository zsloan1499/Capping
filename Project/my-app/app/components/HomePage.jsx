'use client'

import Link from 'next/link';

export default function HomePage(){
    return(
        <div>
            <div>Homepage</div>
             {/* Button that navigates to /new-page */}
             <Link href="/UserInfo">
                <button className="bg-blue-500 text-white p-2 rounded">
                    Go to Profile Info
                </button>
            </Link>
        </div>


    );
}