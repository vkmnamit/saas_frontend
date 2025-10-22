import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./signup.css";

export default function SignUpPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        businessName: "",
        businessAddress: "",
        businessPhone: "",
        businessType: "",
        businessDescription: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Prepare payload matching backend field names
        const payload = {
            name: form.name,
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
            businessName: form.businessName,
            businessType: form.businessType,
            businessPhone: form.businessPhone,
            businessAddress: form.businessAddress,
            businessDescription: form.businessDescription,
        };

        try {
            const res = await fetch('http://localhost:5002/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || 'Registration failed');
                return;
            }

            alert(data.message || 'Account created successfully!');
            navigate('/signin');
        } catch (err) {
            console.error(err);
            alert('Server error. Please try again later.');
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h1>Create Your Business Account</h1>
                    <p>Join thousands of businesses already using our platform</p>
                </div>
                <div className="signup-content">
                    <form onSubmit={handleSignUp} className="signup-form">
                        {/* Personal Information Section */}
                        <div className="form-section">
                            <h3>Personal Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name *</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="password">Password *</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Create a strong password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password *</label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Re-enter your password"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Business Information Section */}
                        <div className="form-section">
                            <h3>Business Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="businessName">Business Name *</label>
                                    <input
                                        id="businessName"
                                        name="businessName"
                                        type="text"
                                        placeholder="Enter your business name"
                                        value={form.businessName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="businessType">Business Type *</label>
                                    <input
                                        id="businessType"
                                        name="businessType"
                                        type="text"
                                        placeholder="e.g., Restaurant, E-commerce, Consulting"
                                        value={form.businessType}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="businessAddress">Business Address *</label>
                                <input
                                    id="businessAddress"
                                    name="businessAddress"
                                    type="text"
                                    placeholder="Enter your business address"
                                    value={form.businessAddress}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="businessPhone">Business Phone *</label>
                                <input
                                    id="businessPhone"
                                    name="businessPhone"
                                    type="tel"
                                    placeholder="Enter your business phone number"
                                    value={form.businessPhone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="businessDescription">Business Description *</label>
                                <textarea
                                    id="businessDescription"
                                    name="businessDescription"
                                    placeholder="Tell us about your business and what you do..."
                                    value={form.businessDescription}
                                    onChange={handleChange}
                                    rows="4"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="signup-button">
                            Create My Account
                        </button>

                        <p className="signin-link">
                            Already have an account?{" "}
                            <Link to="/signin">
                                Sign In Here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}