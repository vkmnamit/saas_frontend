import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

export default function Cart() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('http://localhost:5002/api/users/profile', { credentials: 'include' });
                if (!res.ok) {
                    console.error('Failed to fetch profile:', res.status, await res.text());
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                setUserId(data._id || data.user?._id || '');
            } catch (err) {
                console.error('Failed to fetch profile for cart', err);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                // Guest cart from localStorage
                const guestKey = 'guest_cart_v1';
                const raw = localStorage.getItem(guestKey);
                const guestItems = raw ? JSON.parse(raw) : [];

                if (!userId) {
                    setItems(guestItems);
                    return;
                }

                // Signed-in: fetch server cart and merge with guest cart (guest items -> server)
                const res = await fetch(`/api/users/cart`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    credentials: 'include'
                });
                let serverItems = [];
                if (res.ok) {
                    const data = await res.json();
                    serverItems = data.cartItems || [];
                }

                // Merge guestItems into serverItems client-side for display (server-side merge recommended on signin)
                const merged = [...serverItems];
                guestItems.forEach(g => {
                    const found = merged.find(s => s.productId === g.productId);
                    if (found) {
                        found.quantity = (found.quantity || 0) + (g.quantity || 0);
                    } else {
                        // add guest item shape to merged list
                        merged.push({ ...g, _id: `guest-${g.productId}` });
                    }
                });

                setItems(merged);
            } catch (err) {
                console.error('Error fetching cart', err);
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [userId]);

    if (loading) return (
        <div className="loading">
            <div className="loading-spinner"></div>
            Loading cart...
        </div>
    );

    // Calculate total value
    const totalValue = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

    return (
        <div className="cart-container">
            <div className="cart-header">
                <h1 className="cart-title">Shopping Cart</h1>
                <p className="cart-subtitle">Review your items before checkout</p>
            </div>

            {items.length === 0 ? (
                <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <h2 className="empty-cart-title">Your cart is empty</h2>
                    <p className="empty-cart-message">Looks like you haven't added any items to your cart yet.</p>
                    <button className="shop-now-button" onClick={() => navigate('/product-order')}>
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items">
                        {items.map(item => (
                            <div key={item._id} className="cart-item">
                                <div className="item-image">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.productName} />
                                    ) : (
                                        <div className="item-image-placeholder">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="item-details">
                                    <h3 className="item-name">{item.productName}</h3>
                                    <p className="item-description">{item.description || 'No description available'}</p>
                                    <span className="item-category">{item.category || 'General'}</span>
                                    <div className="item-price">₹{item.price}</div>
                                    <div className="item-quantity">
                                        <span className="remove" onClick={() => removeItem(item._id)}>Remove</span>
                                        <span className="quantity-label">Quantity:</span>
                                        <span className="quantity-display">{item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2 className="summary-title">Order Summary</h2>
                        <div className="summary-row">
                            <span className="summary-label">Items ({items.length})</span>
                            <span className="summary-value">{items.length}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Subtotal</span>
                            <span className="summary-value">₹{totalValue}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Shipping</span>
                            <span className="summary-value">Free</span>
                        </div>
                        <div className="summary-row summary-total">
                            <span className="summary-label">Total</span>
                            <span className="summary-value">₹{totalValue}</span>
                        </div>
                        <button className="proceed-button" onClick={() => navigate('/payment')}>
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            )}

            <button className="back-button" onClick={() => navigate('/product-order')}>
                ← Back to Products
            </button>
        </div>
    );
    function removeItem(itemId) {
        const updatedItems = items.filter(i => i._id !== itemId);
        setItems(updatedItems);

        if (!userId) {
            // Guest cart in localStorage
            const guestKey = 'guest_cart_v1';
            const raw = localStorage.getItem(guestKey);
            const guestItems = raw ? JSON.parse(raw) : [];
            const newGuestItems = guestItems.filter(i => `guest-${i.productId}` !== itemId);
            localStorage.setItem(guestKey, JSON.stringify(newGuestItems));
            return;
        }

        // Signed-in: remove from server cart
        (async () => {
            try {
                const res = await fetch(`/api/users/cart/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    credentials: 'include'
                });
                if (!res.ok) {
                    console.error('Failed to remove item from server cart');
                }
            } catch (err) {
                console.error('Failed to remove item from server cart', err);
            }
        })();
    }
}