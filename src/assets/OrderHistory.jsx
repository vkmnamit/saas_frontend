import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderHistory.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const navigate = useNavigate();

    const ordersPerPage = 10;

    const [userId, setUserId] = useState(null);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch('http://localhost:5002/api/users/profile', {
                method: 'GET',
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setUserId(data._id || data.user?._id);
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchOrderHistory();
            const interval = setInterval(fetchOrderHistory, 15000);
            return () => clearInterval(interval);
        }
    }, [userId, page]);

    const fetchOrderHistory = async () => {
        try {
            if (!userId) return;
            setLoading(page === 1 && orders.length === 0); // Only show full loader on first load
            // const userId = localStorage.getItem('userId') || '000000000000000000000000'; // This line is now redundant as userId comes from state
            const skip = (page - 1) * ordersPerPage;

            const response = await fetch(
                `http://localhost:5002/api/orders/order-history/${userId}?skip=${skip}&limit=${ordersPerPage}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch order history');
            }

            const data = await response.json();
            // Handle both data.orders and data.invoices to be safe
            setOrders(data.invoices || data.orders || []);
            setTotalOrders(data.pagination?.total || data.total || 0);
            setError('');
        } catch (err) {
            console.error('Error fetching order history:', err);
            setError('Failed to load order history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    if (loading) {
        return (
            <div className="order-history-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading order history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-history-container">
            <div className="history-header">
                <h1 className="history-title">📋 Order History</h1>
                <p className="history-subtitle">View all your past orders and invoices</p>
                <button className="refresh-button" onClick={fetchOrderHistory}>
                    🔄 Refresh
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="no-orders">
                    <div className="no-orders-icon">📦</div>
                    <h2 className="no-orders-title">No Orders Yet</h2>
                    <p className="no-orders-message">Your order history will appear here once you make a purchase.</p>
                    <button
                        className="shop-now-button"
                        onClick={() => navigate('/product-order')}
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <>
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className="order-header">
                                    <div className="order-number">
                                        <span className="label">Invoice:</span>
                                        <span className="value">{order.invoiceNumber}</span>
                                    </div>
                                    <div className="order-date">
                                        <span className="date-icon">📅</span>
                                        {formatDate(order.createdAt)}
                                    </div>
                                </div>

                                <div className="order-customer">
                                    <div className="customer-info">
                                        <span className="customer-icon">👤</span>
                                        <div>
                                            <div className="customer-name">{order.customerName}</div>
                                            <div className="customer-contact">{order.customerEmail}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-items">
                                    <h4 className="items-title">Items Ordered:</h4>
                                    <div className="items-grid">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="item-row">
                                                <span className="item-name">{item.productName}</span>
                                                <span className="item-quantity">Qty: {item.quantity}</span>
                                                <span className="item-price">₹{item.subtotal}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="order-summary">
                                    <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span>₹{order.subtotal}</span>
                                    </div>
                                    {order.tax > 0 && (
                                        <div className="summary-row">
                                            <span>Tax:</span>
                                            <span>₹{order.tax}</span>
                                        </div>
                                    )}
                                    {order.discount > 0 && (
                                        <div className="summary-row discount">
                                            <span>Discount:</span>
                                            <span>-₹{order.discount}</span>
                                        </div>
                                    )}
                                    <div className="summary-row total">
                                        <span>Total Amount:</span>
                                        <span>₹{order.totalAmount}</span>
                                    </div>
                                </div>

                                <div className="order-payment">
                                    <span className={`payment-status ${order.paymentDetails?.paymentStatus}`}>
                                        {order.paymentDetails?.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                    </span>
                                    <span className="payment-method">
                                        via {order.paymentDetails?.paymentMethod || 'N/A'}
                                    </span>
                                </div>

                                <div className="order-actions">
                                    <button
                                        className="view-invoice-button"
                                        onClick={() => navigate(`/invoice/${order._id}`)}
                                    >
                                        📄 View Invoice
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-button"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                ← Previous
                            </button>

                            <div className="pagination-info">
                                Page {page} of {totalPages} ({totalOrders} total orders)
                            </div>

                            <button
                                className="pagination-button"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrderHistory;
