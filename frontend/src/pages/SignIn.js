import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import {Button} from "@mui/material";

const SignIn = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [isSigningUp, setIsSigningUp] = useState(false); // Toggle Sign In / Sign Up
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(''); // Only for Sign Up
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Only for Sign Up
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const API_BASE_URL = "http://127.0.0.1:55000"; // Your Flask backend

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (isSigningUp) {
            // Sign Up Validation
            if (!email || !username || !password || !confirmPassword) {
                setError("All fields are required.");
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }

            // Send Sign Up request to backend
            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, username, password }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Registration failed");

                Cookies.set("user_id", data.user_id, { expires: 7 }); // Set the cookie for 7 days
                Cookies.set("username", data.username, { expires: 7 });
                console.log("User logged in and cookie set!");
                console.log(data);

                setMessage(data.message);
                setIsSigningUp(false); // Switch to Sign In after registration
            } catch (err) {
                setError(err.message);
            }
        } else {
            // Sign In Validation
            if (!email || !password) {
                setError("Email and password are required.");
                return;
            }

            // Send Login request to backend
            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Login failed");

                Cookies.set("user_id", data.user_id, { expires: 7 }); // Set the cookie for 7 days
                Cookies.set("username", data.username, { expires: 7 });
                console.log("User logged in and cookie set!");

                setIsAuthenticated(true);
                navigate('/'); // Redirect to homepage
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const inputStyle = {
        display: "block",
        marginBottom: "15px",
        padding: "10px",
        width: "100%",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "1rem"
    };

    const labelStyle = {
        fontWeight: "bold",
        color: "#4B0082", // Dark purple
        marginBottom: "5px"
    };

    return (
        <div style={{ display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #32CD32, #800080)" }}>
            <div style={{
                backgroundColor: "#ffffff",
                padding: "40px",
                borderRadius: "15px",
                boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
                width: "350px",
                textAlign: "center"
            }}>
            <h2 style={{color: "#800080"}}>{isSigningUp ? "Sign Up" : "Sign In"}</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}

            <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left", width: "300px" }}>
                {isSigningUp && (
                    <div>
                        <label style={{color: "#800080"}}>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%" }}
                        />
                    </div>
                )}

                <div>
                    <label style={{color: "#800080"}}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%" }}
                    />
                </div>
                <div>
                    <label style={{color: "#800080"}}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%" }}
                    />
                </div>

                {isSigningUp && (
                    <div>
                        <label style={{color: "#800080"}}>Confirm Password:</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%" }}
                        />
                    </div>
                )}

                <Button type="submit" variant="contained" style={{ padding: "10px", width: "100%", cursor: "pointer",  backgroundColor: "#32CD32",
                    color: "#fff",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    textTransform: "none" }}>
                    {isSigningUp ? "Sign Up" : "Sign In"}
                </Button>
            </form>

            <p style={{color: "#800080"}}>
                {isSigningUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                    onClick={() => { setIsSigningUp(!isSigningUp); setError(''); setMessage(''); }}
                    style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}>
                    {isSigningUp ? "Sign In" : "Sign Up"}
                </button>
            </p>
            </div>
        </div>
    );
};

export default SignIn;
