'use client';

// Imports
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {

    // State variables
    const [fName, setfName] = useState("");
    const [lName, setlName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [retypepassword, setRetypePassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    // Special characters array for password validation
    const specialCharacters = [".", "/", "<", "!", "@"];
    const numberArray = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const emailCheck = ["@gmail.com", "@outlook.com", "@outlook.edu", "@aol.com"];

    // Email validation function
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && emailCheck.some(domain => email.endsWith(domain));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fName || !lName || !email || !username || !password || !retypepassword) {
            setError("All fields need to be filled in");
            return;
        }

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address (e.g., example@gmail.com)");
            return;
        }

        if (password !== retypepassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        const hasSpecialChar = specialCharacters.some(char => password.includes(char));
        const hasNumber = numberArray.some(num => password.includes(num));

        if (!hasSpecialChar) {
            setError("Password must include at least one special character");
            return;
        }

        if (!hasNumber) {
            setError("Password must include at least one number");
            return;
        }

        try {
            const resUserExists = await fetch('api/userExists', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, username }),
            });

            const { emailExists, usernameExists, user } = await resUserExists.json();

            if (emailExists) {
                setError("Email already exists");
                return;
            }

            if (usernameExists) {
                setError("Username already exists");
                return;
            }

            if (user) {
                setError("User already exists");
                return;
            }

            const res = await fetch('api/register', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fName, lName, username, email, password, retypepassword }),
            });

            if (res.ok) {
                e.target.reset();
                router.push("/");
            } else {
                console.log("Registration failed");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <title>Melodi</title>
            <div className="bg-customBlue w-screen h-screen flex items-center justify-center">
                {/* Centered box with shadow */}
                <div className="bg-customBlue2 shadow-lg border-4 border-black p-8 rounded-lg flex flex-col items-center max-w-xl w-full">
                    <div className="text-white text-2xl mb-4">Register for Melodi</div>
                    <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
                        <input onChange={e => setfName(e.target.value)} type="text" placeholder="First Name" className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white" />
                        <input onChange={e => setlName(e.target.value)} type="text" placeholder="Last Name" className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white" />
                        <input onChange={e => setUsername(e.target.value)} type="text" placeholder="Username" className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white" />
                        <input onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white" />
                        <input onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white" />
                        <input onChange={e => setRetypePassword(e.target.value)} type="password" placeholder="Retype Password" className="border border-gray-300 rounded p-2 w-full m-2 bg-customBlue2 text-white" />
                        <button type="submit" className="bg-green-500 text-white w-full p-2 rounded m-2 font-bold cursor-pointer">Register</button>
                    </form>
                    {error && <div className="bg-red-500 text-white text-sm m-2 w-full p-2 rounded">{error}</div>}
                    <Link className="text-sm text-white m-2" href={'/'}>Already have an account? <span className="underline">Login</span></Link>
                </div>
            </div>
        </div>
    );
}
