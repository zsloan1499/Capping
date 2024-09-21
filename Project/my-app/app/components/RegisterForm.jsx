'use client'

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm(){

    const [fName, setfName] = useState("");
    const [lName, setlName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [retypepassword, setRetypePassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    //special characters array for password for later use
    const specialCharacters = [".","/","<"]
    const numberArray = ["0","1","2","3","4","5","6","7","8","9"]
    const emailCheck = ["@gmail.com","@outlook.com","@outlook.edu"]

    const handleSubmit = async (e) => {
        // will not reload page if nothing is submitted
        e.preventDefault();
        if (!fName || !lName || !email || !username || !password || !retypepassword){
            setError("all fields need to be filled in");
            return;

        }

        if (password !== retypepassword) {
            setError("Passwords do not match");
            return;
        }

        try {

            const resUserExists = await fetch('api/userExists', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, username }),
            });
    
            const { user, emailExists, usernameExists } = await resUserExists.json();
            
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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fName,
                    lName,
                    username,
                    email,
                    password,
                    retypepassword,
                })
            })

            if (res.ok){
                const form = e.target;
                form.reset();
                router.push("/");
            } else{
                console.log("registration failed");
            }
        } catch (error) {}
    };


    return (
        <div>
            <div className = "m-2">Register Form</div>
            <div>
                <form onSubmit = {handleSubmit}>
                <label className = "m-2">First Name:</label>
                    <br/>
                    <input onChange = {(e) => setfName(e.target.value)} type = "text" placeholder = "First Name" className = "border border-gray-900 m-2"/>
                    <br />
                    <label className = "m-2">Last Name:</label>
                    <br/>
                    <input  onChange = {(e) => setlName(e.target.value)} type = "text" placeholder = "Last Name" className = "border border-gray-900 m-2"/>
                    <br />
                    <label className = "m-2">Username:</label>
                    <br/>
                    <input onChange = {(e) => setUsername(e.target.value)} type = "text" placeholder = "UserName" className = "border border-gray-900 m-2"/>
                    <br/>
                    <label className = "m-2">Email:</label>
                    <br/>
                    <input  onChange = {(e) => setEmail(e.target.value)}type = "text" placeholder = "Email" className = "border border-gray-900 m-2"/>
                    <br/>
                    <label  className = "m-2">Password:</label>
                    <br/>
                    <input onChange = {(e) => setPassword(e.target.value)} type = "password" placeholder = "Password" className = "border border-gray-900 m-2" />
                    <br/>
                    <label className = "m-2">Retype Password:</label>
                    <br/>
                    <input onChange = {(e) => setRetypePassword(e.target.value)} type = "password" placeholder = "Password" className = "border border-gray-900 m-2" />
                    <br/>
                    <button type = "submit" className = "bg-green-500 m-2 text-white w-16 font-bold cursor-pointer">Register</button>
                    { error && (
                        <div className = "bg-red-500 text-white text-sm m-2 w-fit ">
                            {error}
                        </div>
                        )
                    }
                    <Link className = "text-sm  m-2"href={'/'}>
                        Already have an account? <span className = "underline">Login </span>
                    </Link>
                </form>
            </div>
        </div>
    );

}