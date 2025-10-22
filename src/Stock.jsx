import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Stock.css';

export default function Stock() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRealTime, setIsRealTime] = useState(true);
    const [lowStockThreshold, setLowStockThreshold] = useState(10);
    const [sortBy, setSortBy] = useState('stock');
    const [filterBy, setFilterBy] = useState('all');

    const fetchStockData = async () => {
        try {
            const res = await fetch('http://localhost:5002/api/products', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            } else {
                setError('Failed to fetch stock data');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockData();
        
        // Set up real-time updates every 15 seconds
        let interval;
        if (isRealTime) {
            interval = setInterval(fetchStockData, 15000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRealTime]);

    const getStockStatus = (stock) => {
        if (stock === 0) return { status: 'out', color: '#dc3545', label: 'Out of Stock' };
        if (stock <= lowStockThreshold) return { status: 'low', color: '#ffc107', label: 'Low Stock' };
        return { status: 'good', color: '#28a745', label: 'In Stock' };
    };

    const filteredProducts = products.filter(product => {
        if (filterBy === 'low') return product.stock <= lowStockThreshold;
        if (filterBy === 'out') return product.stock === 0;
        if (filterBy === 'good') return product.stock > lowStockThreshold;
        return true;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'stock':
                return a.stock - b.stock;
            case 'name':
                return a.productName.localeCompare(b.productName);
            case 'price':
                return a.price - b.price;
            case 'category':
                return a.category?.localeCompare(b.category) || 0;
            default:
                return 0;
        }
    });

    const stockStats = {
        total: products.length,
        inStock: products.filter(p => p.stock > lowStockThreshold).length,
        lowStock: products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    };

    if (loading) {
        return (
            <div className="stock-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading stock data...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="stock-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="stock-container">
            <div className="stock-header">
                <div>
                    <h1 className="stock-title">Live Stock Management</h1>
                    <p className="stock-subtitle">Real-time inventory tracking and monitoring</p>
                </div>
                <div className="stock-controls">
                    <button
                        className={`live-toggle ${isRealTime ? 'active' : ''}`}
                        onClick={() => setIsRealTime(!isRealTime)}
                    >
                        {isRealTime ? '🔄 Live' : '⏸️ Paused'}
                    </button>
                    <button className="refresh-btn" onClick={fetchStockData}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            <div className="stock-stats">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <div className="stat-value">{stockStats.total}</div>
                        <div className="stat-label">Total Products</div>
                    </div>
                </div>
                <div className="stat-card good">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value">{stockStats.inStock}</div>
                        <div className="stat-label">In Stock</div>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <div className="stat-value">{stockStats.lowStock}</div>
                        <div className="stat-label">Low Stock</div>
                    </div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <div className="stat-value">{stockStats.outOfStock}</div>
                        <div className="stat-label">Out of Stock</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <div className="stat-value">₹{stockStats.totalValue.toLocaleString()}</div>
                        <div className="stat-label">Total Value</div>
                    </div>
                </div>
            </div>

            <div className="stock-filters">
                <div className="filter-group">
                    <label>Filter:</label>
                    <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                        <option value="all">All Products</option>
                        <option value="good">In Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Sort by:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="stock">Stock Level</option>
                        <option value="name">Product Name</option>
                        <option value="price">Price</option>
                        <option value="category">Category</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Low Stock Threshold:</label>
                    <input
                        type="number"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                        min="1"
                        max="100"
                    />
                </div>
            </div>

            <div className="stock-table-container">
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Value</th>
                            <th>Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedProducts.map((product) => {
                            const stockStatus = getStockStatus(product.stock);
                            return (
                                <tr key={product._id} className={`stock-row ${stockStatus.status}`}>
                                    <td>
                                        <div className="product-info">
                                            {product.imageUrl && (
                                                <img src={product.imageUrl} alt={product.productName} className="product-thumb" />
                                            )}
                                            <div>
                                                <div className="product-name">{product.productName}</div>
                                                <div className="product-description">{product.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="category-badge">{product.category || 'General'}</span>
                                    </td>
                                    <td className="price-cell">₹{product.price}</td>
                                    <td className="stock-cell">
                                        <div className="stock-level">
                                            <span className="stock-number">{product.stock}</span>
                                            <div className="stock-bar">
                                                <div 
                                                    className="stock-fill" 
                                                    style={{ 
                                                        width: `${Math.min(100, (product.stock / Math.max(lowStockThreshold * 2, 20)) * 100)}%`,
                                                        backgroundColor: stockStatus.color
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span 
                                            className="status-badge" 
                                            style={{ backgroundColor: stockStatus.color }}
                                        >
                                            {stockStatus.label}
                                        </span>
                                    </td>
                                    <td className="value-cell">₹{(product.price * product.stock).toLocaleString()}</td>
                                    <td className="date-cell">
                                        {new Date(product.updatedAt || product.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {sortedProducts.length === 0 && (
                <div className="no-products">
                    <div className="no-products-icon">📦</div>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or add some products to your catalog.</p>
                </div>
            )}

            <button className="back-button" onClick={() => window.history.back()}>
                ← Back
            </button>
        </div>
    );
}
