import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
    const [settings, setSettings] = useState({
        storeName: '',
        currency: 'USD',
        taxRate: 0,
        shippingFee: 0,
        theme: 'light',
    });
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const response = await fetch('http://localhost:5002/api/settings');
            const data = await response.json();
            setSettings(data);

            // Set initial theme based on fetched data or stored preference
            const savedTheme = localStorage.getItem('theme') || data.theme || 'light';
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                setIsDarkMode(true);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });

        // If theme is changed via dropdown, apply it immediately
        if (name === 'theme') {
            if (value === 'dark') {
                document.body.classList.add('dark-theme');
                setIsDarkMode(true);
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                setIsDarkMode(false);
                localStorage.setItem('theme', 'light');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:5002/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        });
        const data = await response.json();
        alert(data.message);
    };

    const toggleTheme = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';

        if (newTheme === 'dark') {
            document.body.classList.add('dark-theme');
            setIsDarkMode(true);
        } else {
            document.body.classList.remove('dark-theme');
            setIsDarkMode(false);
        }

        // Update settings state
        setSettings({ ...settings, theme: newTheme });

        // Save to localStorage
        localStorage.setItem('theme', newTheme);
    };

    return (
        <div className="settings-container">
            <h1>Settings</h1>
            <p className="settings-subtitle">Manage your store preferences and configuration</p>
            <button onClick={toggleTheme}>
                {isDarkMode ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
            </button>
            <form onSubmit={handleSubmit}>
                <label>
                    <span>Store Name</span>
                    <input
                        type="text"
                        name="storeName"
                        value={settings.storeName}
                        onChange={handleChange}
                        placeholder="Enter your store name"
                        required
                    />
                </label>
                <label>
                    <span>Currency</span>
                    <select
                        name="currency"
                        value={settings.currency}
                        onChange={handleChange}
                    >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="INR">INR - Indian Rupee</option>
                    </select>
                </label>
                <label>
                    <span>Tax Rate (%)</span>
                    <input
                        type="number"
                        name="taxRate"
                        value={settings.taxRate}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max="100"
                    />
                </label>
                <label>
                    <span>Shipping Fee</span>
                    <input
                        type="number"
                        name="shippingFee"
                        value={settings.shippingFee}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                    />
                </label>
                <label>
                    <span>Theme</span>
                    <select
                        name="theme"
                        value={settings.theme}
                        onChange={handleChange}
                    >
                        <option value="light">Light Theme</option>
                        <option value="dark">Dark Theme</option>
                    </select>
                </label>
                <button type="submit">💾 Save Settings</button>
            </form>
        </div>
    );
};

export default Settings;