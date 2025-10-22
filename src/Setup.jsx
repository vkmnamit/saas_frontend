import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Setup.css";
export default function Setup() {
    const [form, setForm] = useState({
        businessName: "",
        businessAddress: "",
        businessPhone: "",
        businessType: "",
        businessDescription: "",
        bankDetails: "",
        accountNumber: "",
        bankname: "",
        ifscCode: "",
        accountNumberConfirm: "",
        accountType: "",
        currency: "",
        taxId: "",

    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const navigate = useNavigate();

    const handleSetup = async (e) => {
        e.preventDefault();

        // Prepare payload matching backend field names
        const payload = {
            businessName: form.businessName,
            businessType: form.businessType,
            businessPhone: form.businessPhone,
            businessAddress: form.businessAddress,
            businessDescription: form.businessDescription,
        };

        try {
            const res = await fetch('http://localhost:5002/api/users/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || 'Setup failed');
                return;
            }

            alert(data.message || 'Setup completed successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Server error. Please try again later.');
        }
    };

    return (
        <div className="setup-container">
            <div className="setup-card">
                <div className="setup-header">
                    <h1>Business Setup</h1>
                    <p>Provide your business details</p>
                </div>
                <div className="setup-content">
                    <form onSubmit={handleSetup} className="setup-form">
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
                        <   div className="form-group">
                            <label htmlFor="businessType">Business Type *</label>
                            <input
                                id="businessType"
                                name="businessType"
                                type="text"
                                placeholder="Enter your business type (e.g., Retail, Service)"
                                value={form.businessType}
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
                            <label htmlFor="businessDescription">Business Description</label>
                            <textarea
                                id="businessDescription"
                                name="businessDescription"
                                placeholder="Describe your business (optional)"
                                value={form.businessDescription}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="bankDetails">Bank Details *</label>
                            <input
                                id="bankDetails"
                                name="bankDetails"
                                type="text"
                                placeholder="Enter your bank details"
                                value={form.bankDetails}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="taxId">Tax ID *</label>
                            <input
                                id="taxId"
                                name="taxId"
                                type="text"
                                placeholder="Enter your tax ID"
                                value={form.taxId}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="accountNumber">Account Number *</label>
                            <input
                                id="accountNumber"
                                name="accountNumber"
                                type="text"
                                placeholder="Enter your account number"
                                value={form.accountNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="accountNumberConfirm">Confirm Account Number *</label>
                            <input
                                id="accountNumberConfirm"
                                name="accountNumberConfirm"
                                type="text"
                                placeholder="Confirm your account number"
                                value={form.accountNumberConfirm}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="accountType">Account Type *</label>
                            <select
                                id="accountType"
                                name="accountType"
                                value={form.accountType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select account type</option>
                                <option value="savings">Savings</option>
                                <option value="current">Current</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="currency">Currency *</label>
                            <select
                                id="currency"
                                name="currency"
                                value={form.currency}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select currency</option>
                                <option value="usd">USD</option>
                                <option value="inr">INR</option>
                            </select>
                        </div>
                        <button type="submit" className="setup-button">Complete Setup</button>
                    </form>
                </div>
            </div>
        </div>
    );
}