import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


export default function Payment() {
    const [form, setForm] = useState({
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

    const handlePaymentSetup = async (e) => {
        e.preventDefault();

        if (form.accountNumber !== form.accountNumberConfirm) {
            alert("Account numbers do not match!");
            return;
        }

        // Prepare payload matching backend field names
        const payload = {
            bankDetails: form.bankDetails,
            accountNumber: form.accountNumber,
            bankname: form.bankname,
            ifscCode: form.ifscCode,
            accountType: form.accountType,
            currency: form.currency,
            taxId: form.taxId,
        };

        try {
            const res = await fetch('http://localhost:5002/api/users/payment-setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || 'Payment setup failed');
                return;
            }

            alert(data.message || 'Payment setup completed successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Server error. Please try again later.');
        }
    };

    return (
        <div className="payment-container">
            <div className="payment-card">
                <div className="payment-header">
                    <h1>Payment Setup</h1>
                    <p>Enter your payment details</p>
                </div>
                <div className="payment-content">
                    <form onSubmit={handlePaymentSetup} className="payment-form">
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
                    </form>
                </div>
            </div>
        </div>
    );
}