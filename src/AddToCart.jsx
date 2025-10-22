import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function AddToCart() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        // Get current user
        (async () => {
            try {
                const res = await fetch('http://localhost:5001/api/users/profile', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserId(data._id);
                }
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
            }
        })();
    }, []);

    useEffect(() => {
        // Fetch product details
        if (!productId) return;

        (async () => {
            try {
                const res = await fetch(`http://localhost:5002/api/products/single/${productId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                } else {
                    alert('Product not found');
                    navigate('/product-order');
                }
            } catch (err) {
                console.error('Failed to fetch product:', err);
                alert('Failed to load product details');
            } finally {
                setLoading(false);
            }
        })();
    }, [productId, navigate]);

    const handleAddToCart = async () => {
        if (!product) {
            alert('No product selected');
            return;
        }

        const cartItem = {
            productId: product._id,
            quantity,
            productName: product.productName,
            price: product.price,
        };

        // If user signed in, persist to server
        if (userId) {
            try {
                const res = await fetch('/api/users/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    credentials: 'include',
                    body: JSON.stringify({ ...cartItem, userId })
                });

                if (res.ok) {
                    alert('Product added to cart successfully!');
                    navigate('/cart');
                    return;
                }
                const data = await res.json().catch(() => ({}));
                alert(data.message || 'Failed to add to cart');
                return;
            } catch (err) {
                console.error('Failed to add to cart (server):', err);
                alert('Failed to add to cart (server).');
                return;
            }
        }

        // Guest: persist to localStorage
        try {
            const key = 'guest_cart_v1';
            const raw = localStorage.getItem(key);
            const arr = raw ? JSON.parse(raw) : [];
            // if product already in cart increase quantity
            const idx = arr.findIndex(i => i.productId === cartItem.productId);
            if (idx >= 0) {
                arr[idx].quantity = (arr[idx].quantity || 0) + cartItem.quantity;
            } else {
                arr.push({ ...cartItem });
            }
            localStorage.setItem(key, JSON.stringify(arr));
            alert('Product added to cart (guest)');
            navigate('/cart');
        } catch (err) {
            console.error('Failed to update guest cart:', err);
            alert('Failed to add to cart');
        }
    };

    if (loading) {
        return <div style={{ padding: 20 }}>Loading product details...</div>;
    }

    if (!product) {
        return <div style={{ padding: 20 }}>Product not found</div>;
    }

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
            <h2>Add to Cart</h2>

            <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                <h3>{product.productName}</h3>
                <p><strong>Description:</strong> {product.description}</p>
                <p><strong>Price:</strong> ${product.price}</p>
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Stock:</strong> {product.stock}</p>
                {product.imageUrl && (
                    <img
                        src={product.imageUrl}
                        alt={product.productName}
                        style={{ maxWidth: '300px', marginTop: 10 }}
                    />
                )}
            </div>

            <div style={{ marginBottom: 20 }}>
                <label>
                    <strong>Quantity:</strong>
                    <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        style={{ marginLeft: 10, padding: 5 }}
                    />
                </label>
                <p style={{ fontSize: '0.9em', color: '#666' }}>
                    Available stock: {product.stock}
                </p>
            </div>

            <div style={{ marginBottom: 20 }}>
                <strong>Total: ${(product.price * quantity).toFixed(2)}</strong>
            </div>

            <div>
                <button
                    onClick={handleAddToCart}
                    style={{
                        background: '#000000ff',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        marginRight: 10
                    }}
                >
                    Add to Cart
                </button>

                <button
                    onClick={() => navigate('/product-order')}
                    style={{
                        background: '#000000ff',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    Back to Products
                </button>
                <Link to="/payment">
                    <button>Buy Now</button>
                </Link>
            </div>
        </div>
    );
}
