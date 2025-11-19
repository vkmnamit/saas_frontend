import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./sign_in.css";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignIn = (e) => {
        e.preventDefault();
      
        (async () => {
            try {
                const res = await fetch('/api/users/signin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();
                if (!res.ok) {
                    alert(data.message || 'Sign-in failed');
                    return;
                }

                alert(data.message || 'Sign-In successful!');
                navigate('/dashboard');
            } catch (err) {
                console.error(err);
                alert('Server error. Please try again later.');
            }
        })();
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <div className="signin-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>
                <div className="signin-content">
                    <form onSubmit={handleSignIn} className="signin-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="signin-button">Sign In</button>
                    </form>
                </div>
            </div>
        </div>
    );
}