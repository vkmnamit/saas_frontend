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
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        const fetchStats = async (uid) => {
            try {
                const url = uid
                    ? `http://localhost:5002/api/analytics?userId=${uid}`
                    : 'http://localhost:5002/api/analytics';
                const res = await fetch(url, { credentials: 'include' });
                if (res.ok) {
                    const stats = await res.json();
                    setStats(stats);
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            }
        };

        const fetchRecentOrders = async (uid) => {
            if (!uid) return;
            try {
                const res = await fetch(`http://localhost:5002/api/orders/order-history/${uid}?limit=5`, { credentials: 'include' });
                if (res.ok) {
                    const orderData = await res.json();
                    setRecentOrders(orderData.invoices || []);
                }
            } catch (err) {
                console.error('Error fetching recent orders:', err);
            }
        };

        (async () => {
            try {
                const res = await fetch('http://localhost:5002/api/users/profile', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (res.status === 401) {
                    alert('You are not authenticated. Redirecting to sign-in.');
                    navigate('/signin');
                    return;
                }

                if (res.ok) {
                    const result = await res.json();
                    const profileData = result.user || result;
                    setData(profileData);
                    setUserRole(profileData.role || '');

                    if (profileData._id) {
                        fetchStats(profileData._id);
                        fetchRecentOrders(profileData._id);
                    }
                }
            } catch (err) {
                console.error('Server error:', err);
            }
        })();

        const loadProducts = async () => {
            try {
                setLoadingProducts(true);
                const res = await fetch('/api/products');
                if (res.ok) {
                    const productsData = await res.json();
                    setProducts(productsData.slice(0, 6));
                }
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoadingProducts(false);
            }
        };

        loadProducts();

        const interval = setInterval(() => {
            if (data?._id) {
                fetchStats(data._id);
                fetchRecentOrders(data._id);
            }
            loadProducts();
        }, 30000);

        return () => clearInterval(interval);
    }, [navigate, data?._id]);

    const [stats, setStats] = useState({
        totalOrders: 0,
        totalOrderValue: 0,
        totalProducts: 0,
        totalCartItems: 0
    });

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

                {/* Dashboard Stats Cards */}
                <div className="dashboard-stats-grid">
                    <div className="dashboard-stat-card">
                        <div className="stat-icon-wrapper sales">💰</div>
                        <div className="stat-details">
                            <h3>Total Revenue</h3>
                            <p className="stat-number">₹{stats.totalOrderValue.toLocaleString()}</p>
                            <span className="stat-trend positive">↑ Live</span>
                        </div>
                    </div>
                    <div className="dashboard-stat-card">
                        <div className="stat-icon-wrapper orders">📦</div>
                        <div className="stat-details">
                            <h3>Total Orders</h3>
                            <p className="stat-number">{stats.totalOrders}</p>
                            <span className="stat-trend positive">↑ Live</span>
                        </div>
                    </div>
                    <div className="dashboard-stat-card">
                        <div className="stat-icon-wrapper products">🛍️</div>
                        <div className="stat-details">
                            <h3>Active Products</h3>
                            <p className="stat-number">{stats.totalProducts}</p>
                            <span className="stat-trend">Catalog</span>
                        </div>
                    </div>
                    <div className="dashboard-stat-card">
                        <div className="stat-icon-wrapper carts">🛒</div>
                        <div className="stat-details">
                            <h3>Products in Cart</h3>
                            <p className="stat-number">{stats.totalCartItems}</p>
                            <span className="stat-trend pending">Pending</span>
                        </div>
                    </div>
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

                {/* Recent Orders Section */}
                <div className="recent-orders-section">
                    <div className="section-header">
                        <h2>Recent Order History</h2>
                        <Link to="/orders" className="view-all">View All Orders →</Link>
                    </div>

                    <div className="orders-table-wrapper">
                        {recentOrders.length > 0 ? (
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order._id} onClick={() => navigate(`/invoice/${order._id}`)}>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="order-id-cell">{order.invoiceNumber}</td>
                                            <td>{order.customerName}</td>
                                            <td className="amount-cell">₹{order.totalAmount.toLocaleString()}</td>
                                            <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="no-orders-msg">No recent orders found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
