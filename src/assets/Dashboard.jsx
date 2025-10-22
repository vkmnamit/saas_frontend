import { useState, useEffect } from "react";
import "./dashboard.css";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
    const [data, setData] = useState({
        name: "Namit Raj",
        email: "namit.raj@example.com",
        phoneNumber: "+91 9876543210"
    });
    const [userRole, setUserRole] = useState('');
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        // Fetch user data from backend API with credentials so httpOnly cookie is sent
        (async () => {
            try {
                const res = await fetch('http://localhost:5002/api/users/profile', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (res.status === 401) {
                    // Not authenticated — redirect to signin
                    alert('You are not authenticated. Redirecting to sign-in.');
                    navigate('/signin');
                    return;
                }

                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const result = await res.json();
                    if (res.ok) {
                        setData(result.user || result);
                        setUserRole(result.user?.role || ''); // Set user role
                    } else {
                        console.error(result.message || 'Failed to fetch user data');
                        alert(result.message || 'Failed to fetch user data. Please try again later.');
                    }
                } else {
                    console.error('Unexpected response format. Expected JSON.');
                    alert('Unexpected response from the server. Please try again later.');
                }
            } catch (err) {
                console.error('Server error. Please try again later.', err);
                alert('Server error. Please try again later.');
            }
        })();

        // Fetch products for top sellers
        (async () => {
            try {
                setLoadingProducts(true);
                const res = await fetch('/api/products');
                if (res.ok) {
                    const productsData = await res.json();
                    setProducts(productsData.slice(0, 6)); // Show top 6 products
                }
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoadingProducts(false);
            }
        })();
    }, [navigate]);

    // Render different dashboards based on user role
    const renderDashboardContent = () => {
        switch (userRole) {
            case 'admin':
                return (
                    <div>
                        <h2>Admin Dashboard</h2>
                        <p>Manage users, products, and analytics.</p>
                    </div>
                );
            case 'seller':
                return (
                    <div>
                        <h2>Seller Dashboard</h2>
                        <p>View your products and orders.</p>
                    </div>
                );
            case 'buyer':
                return (
                    <div>
                        <h2>Buyer Dashboard</h2>
                        <p>Browse products and view your orders.</p>
                    </div>
                );
            default:
                return (
                    <div>
                        <h2>General Dashboard</h2>
                        <p>Welcome to your dashboard.</p>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard">
            {/* Left Sidebar */}
            <div className="left">
                <div className="profile">
                    <img src="/avatar.jpeg" alt="Profile" className="profile-avatar" />
                    <div className="profile-info">
                        <h2>{data?.name}</h2>
                        <p>{data?.email}</p>
                        <p>{data?.phoneNumber}</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/setup" className="nav-item">
                        <span className="nav-icon">⚙️</span>
                        <span>Setup</span>
                    </Link>
                    <Link to="/products/upload" className="nav-item">
                        <span className="nav-icon">⬆️</span>
                        <span>Upload Products</span>
                    </Link>
                    <Link to="/products" className="nav-item">
                        <span className="nav-icon">📦</span>
                        <span>Products</span>
                    </Link>
                    <Link to="/product-order" className="nav-item">
                        <span className="nav-icon">🛒</span>
                        <span>Product Order</span>
                    </Link>
                    <Link to="/analytics" className="nav-item">
                        <span className="nav-icon">📊</span>
                        <span>Analytics</span>
                    </Link>
                    <Link to="/stock" className="nav-item">
                        <span className="nav-icon">📈</span>
                        <span>Stock Alerts</span>
                    </Link>
                    <Link to="/orders" className="nav-item">
                        <span className="nav-icon">📋</span>
                        <span>Orders</span>
                    </Link>

                    <Link to="/settings" className="nav-item">
                        <span className="nav-icon">⚡</span>
                        <span>Settings</span>
                    </Link>
                </nav>
            </div>

            {/* Right Content */}
            <div className="right">
                {/* Top Bar */}
                <div className="top-bar">
                    <h1 className="dashboard-title">Dashboard</h1>
                    <div className="top-actions">
                        <Link to="/cart" className="btn-cart">
                            <span>🛒</span> Cart
                        </Link>
                        <Link to="/" className="btn-logout">
                            <span>🚪</span> Logout
                        </Link>
                    </div>
                </div>

                {/* Seasonal Offer Banner */}
                <div className="offer-banner">
                    <div className="offer-content">
                        <h2>🎉 Seasonal Sale</h2>
                        <p>Get up to 50% OFF on selected products</p>
                        <Link to="/product-order" className="offer-btn">Shop Now →</Link>
                    </div>
                </div>

                {/* Welcome Section */}
                <div className="welcome-section">
                    <h2>Welcome back, {data?.name}! 👋</h2>
                    <p>Here's what's happening with your store today</p>
                </div>

                {/* Top Sellers Section */}
                <div className="top-sellers-section">
                    <div className="section-header">
                        <h2>Top Selling Products</h2>
                        <Link to="/product-order" className="view-all">View All →</Link>
                    </div>

                    {loadingProducts ? (
                        <div className="loading">Loading products...</div>
                    ) : (
                        <div className="products-grid">
                            {products.map((product) => (
                                <div className="product-card" key={product._id}>
                                    <div className="product-image">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.productName} />
                                        ) : (
                                            <div className="no-image">No Image</div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.productName}</h3>
                                        <p className="product-description">
                                            {product.description?.substring(0, 60)}...
                                        </p>
                                        <div className="product-footer">
                                            <span className="product-price">₹{product.price.toLocaleString()}</span>
                                            <Link to="/product-order" className="product-btn">View</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
