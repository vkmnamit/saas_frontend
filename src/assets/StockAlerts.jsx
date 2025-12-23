import React, { useState, useEffect } from 'react';
import './StockAlerts.css';

const StockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const initialize = async () => {
            const id = await fetchUserId();
            if (id) {
                fetchStockAlerts(id);
            }
        };
        initialize();
    }, []);

    const fetchUserId = async () => {
        try {
            const res = await fetch('http://localhost:5002/api/users/profile', {
                method: 'GET',
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                return data._id || data.user?._id;
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        }
        return null;
    };

    const fetchStockAlerts = async (uid) => {
        try {
            setLoading(true);
            const userId = uid || await fetchUserId();

            if (!userId) {
                setError('Unable to identify user. Please sign in.');
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:5002/api/orders/stock-alerts/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch stock alerts');
            }

            const data = await response.json();
            setAlerts(data.alerts || []);
            setError('');
        } catch (err) {
            console.error('Error fetching stock alerts:', err);
            setError('Failed to load stock alerts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return '#FF0000'; // Red
            case 'high':
                return '#FF6600'; // Orange
            case 'medium':
                return '#FFA500'; // Yellow-Orange
            default:
                return '#000000';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical':
                return '🔴';
            case 'high':
                return '🟠';
            case 'medium':
                return '🟡';
            default:
                return '⚠️';
        }
    };

    if (loading) {
        return (
            <div className="stock-alerts-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading stock alerts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="stock-alerts-container">
            <div className="alerts-header">
                <h1 className="alerts-title">📊 Stock Alerts</h1>
                <p className="alerts-subtitle">Monitor low inventory levels</p>
                <button className="refresh-button" onClick={fetchStockAlerts}>
                    🔄 Refresh
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {alerts.length === 0 ? (
                <div className="no-alerts">
                    <div className="no-alerts-icon">✅</div>
                    <h2 className="no-alerts-title">All Good!</h2>
                    <p className="no-alerts-message">No low stock alerts at the moment.</p>
                </div>
            ) : (
                <div className="alerts-grid">
                    {alerts.map((alert, index) => (
                        <div
                            key={index}
                            className="alert-card"
                            style={{ borderLeft: `4px solid ${getSeverityColor(alert.severity)}` }}
                        >
                            <div className="alert-header">
                                <span className="alert-severity-icon">
                                    {getSeverityIcon(alert.severity)}
                                </span>
                                <span
                                    className="alert-severity-badge"
                                    style={{ backgroundColor: getSeverityColor(alert.severity) }}
                                >
                                    {alert.severity.toUpperCase()}
                                </span>
                            </div>

                            <div className="alert-body">
                                <h3 className="product-name">{alert.productName}</h3>
                                <div className="alert-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Product ID:</span>
                                        <span className="detail-value">{alert.productId}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Current Stock:</span>
                                        <span className="detail-value stock-value">
                                            {alert.currentStock} units
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Threshold:</span>
                                        <span className="detail-value">10 units</span>
                                    </div>
                                </div>

                                <div className="alert-message">
                                    {alert.severity === 'critical' && '🚨 Out of stock! Reorder immediately.'}
                                    {alert.severity === 'high' && '⚠️ Very low stock! Reorder soon.'}
                                    {alert.severity === 'medium' && '📦 Stock running low. Consider reordering.'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="alerts-summary">
                <div className="summary-card">
                    <div className="summary-icon">🔴</div>
                    <div className="summary-content">
                        <div className="summary-count">
                            {alerts.filter(a => a.severity === 'critical').length}
                        </div>
                        <div className="summary-label">Critical</div>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon">🟠</div>
                    <div className="summary-content">
                        <div className="summary-count">
                            {alerts.filter(a => a.severity === 'high').length}
                        </div>
                        <div className="summary-label">High Priority</div>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon">🟡</div>
                    <div className="summary-content">
                        <div className="summary-count">
                            {alerts.filter(a => a.severity === 'medium').length}
                        </div>
                        <div className="summary-label">Medium</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockAlerts;
