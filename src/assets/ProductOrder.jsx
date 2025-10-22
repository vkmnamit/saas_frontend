import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./ProductOrder.css";



export default function ProductOrder() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const [fetchAll, setFetchAll] = useState(false);
    const [productQuantities, setProductQuantities] = useState({});
    const [addingIds, setAddingIds] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    // load current user id
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('http://localhost:5002/api/users/profile', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    console.error('Failed to fetch user profile:', res.statusText);
                    alert('Unable to fetch user profile. Please try again later.');
                    setUserId('');
                    setFetchAll(true);
                    return;
                }
                const data = await res.json();
                const id = data._id || data.user?._id || '';
                if (!id) {
                    setFetchAll(true);
                }
                setUserId(id);
            } catch (err) {
                console.error('Failed to fetch profile for products', err);
                alert('An error occurred while fetching the user profile. Please check your connection and try again.');
            }
        })();
    }, []);

    useEffect(() => {
        // Fetch products once we know whether to fetch per-user or all
        if (!userId && !fetchAll) return; // wait until we know what to fetch

        (async () => {
            setLoading(true);
            try {
                const url = fetchAll
                    ? '/api/products'
                    : `/api/products?userId=${userId}`;
                const res = await fetch(url);
                if (!res.ok) {
                    if (res.status === 404) {
                        alert('Product not found. It might have been removed or updated.');
                    } else {
                        alert(`Failed to fetch products: ${res.statusText}`);
                    }
                    setProducts([]);
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                // support responses that wrap products in an object { products: [...] }
                const productsArr = Array.isArray(data) ? data : data.products || [];
                console.log('Fetched products:', productsArr);
                console.log('Product imageUrls:', productsArr.map(p => ({ name: p.productName, imageUrl: p.imageUrl })));
                setProducts(productsArr);
                setFilteredProducts(productsArr);
                // initialize per-product quantities to 1
                try {
                    const init = productsArr.reduce((acc, p) => ({ ...acc, [p._id]: 1 }), {});
                    setProductQuantities(init);
                } catch (e) {
                    console.error('Error initializing product quantities', e);
                    setProductQuantities({});
                }
            } catch (err) {
                console.error('Server error fetching products', err);
                alert('Server error fetching products. Please try again later.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [userId, fetchAll]);

    // Filter products based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product =>
                product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    }, [searchQuery, products]);

    // add-to-cart handler: use selected quantity, server for signed-in users, localStorage for guests
    const navigate = useNavigate();

    const handleAddToCart = async (product) => {
        const qty = Math.max(1, productQuantities[product._id] || 1);
        setAddingIds(prev => ({ ...prev, [product._id]: true }));
        try {
            if (userId) {
                const payload = {
                    userId,
                    productId: product._id,
                    quantity: qty,
                    productName: product.productName,
                    price: product.price
                };
                const res = await fetch('/api/users/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    alert('Added to cart');
                    navigate('/cart');
                } else {
                    const data = await res.json().catch(() => ({}));
                    alert(data.message || 'Failed to add to cart');
                }
                return;
            }

            // guest: merge into localStorage
            const key = 'guest_cart_v1';
            const raw = localStorage.getItem(key);
            const arr = raw ? JSON.parse(raw) : [];
            const idx = arr.findIndex(i => i.productId === product._id);
            if (idx >= 0) {
                arr[idx].quantity = (arr[idx].quantity || 0) + qty;
            } else {
                arr.push({ productId: product._id, quantity: qty, productName: product.productName, price: product.price });
            }
            localStorage.setItem(key, JSON.stringify(arr));
            alert('Added to cart (guest)');
            navigate('/cart');
        } catch (err) {
            console.error('Failed to add to cart', err);
            alert('Failed to add to cart. Please try again later.');
        } finally {
            setAddingIds(prev => {
                const next = { ...prev };
                delete next[product._id];
                return next;
            });
        }
    };


    if (loading) return (
        <div className="loading">
            <div className="loading-spinner"></div>
            Loading products...
        </div>
    );

    const ProductCard = ({ product }) => (
        <div className="product-card">
            <div className="product-image">
                {product.imageUrl && product.imageUrl.trim() ? (
                    <img
                        src={product.imageUrl}
                        alt={product.productName}
                        onError={(e) => {
                            console.error('Image failed to load:', product.imageUrl);
                            // Hide broken image and show placeholder div
                            e.target.style.display = 'none';
                            const placeholder = document.createElement('div');
                            placeholder.className = 'product-image-placeholder';
                            placeholder.textContent = '📦 Product Image';
                            placeholder.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 200px; background: linear-gradient(135deg, #000000 0%, #333333 100%); color: white; font-size: 16px; border-radius: 8px;';
                            if (e.target.nextSibling) {
                                e.target.parentNode.insertBefore(placeholder, e.target.nextSibling);
                            } else {
                                e.target.parentNode.appendChild(placeholder);
                            }
                        }}
                    />
                ) : (
                    <div className="product-image-placeholder">
                        📦 No Image Available
                    </div>
                )}
            </div>
            <div className="product-content">
                <h3 className="product-name">{product.productName}</h3>
                <p className="product-description">{product.description || 'No description available'}</p>
                <span className="product-category">{product.category || 'General'}</span>

                <div className="product-price">₹{product.price.toLocaleString()}</div>
                <div className={`product-stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                    {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                </div>

                <div className="quantity-selector">
                    <span className="quantity-label">Quantity:</span>
                    <div className="quantity-controls">
                        <button
                            className="quantity-btn"
                            onClick={() => setProductQuantities(prev => ({
                                ...prev,
                                [product._id]: Math.max(1, (prev[product._id] || 1) - 1)
                            }))}
                            disabled={!product.stock || (productQuantities[product._id] || 1) <= 1}
                        >
                            −
                        </button>
                        <input
                            type="text"
                            className="quantity-input"
                            value={productQuantities[product._id] || 1}
                            readOnly
                        />
                        <button
                            className="quantity-btn"
                            onClick={() => setProductQuantities(prev => ({
                                ...prev,
                                [product._id]: Math.min(product.stock, (prev[product._id] || 1) + 1)
                            }))}
                            disabled={!product.stock || (productQuantities[product._id] || 1) >= product.stock}
                        >
                            +
                        </button>
                    </div>
                </div>

                <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                    disabled={!!addingIds[product._id] || product.stock === 0}
                >
                    {addingIds[product._id] ? 'ADDING...' : product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="product-order-container">
            <div className="product-order-header">
                <div>
                    <h1 className="product-order-title">Product Catalog</h1>
                    <p className="product-order-subtitle">Browse and add products to your cart</p>
                </div>
                <button
                    className="toggle-button"
                    onClick={() => setFetchAll(!fetchAll)}
                >
                    {fetchAll ? 'MY PRODUCTS' : 'ALL PRODUCTS'}
                </button>
            </div>

            <div className="controls-bar">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search products by name, description, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                </div>
                <Link to="/products" className="add-product-btn">+ ADD NEW PRODUCT</Link>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="no-products">
                    <div className="no-products-icon">📦</div>
                    <h2 className="no-products-title">
                        {searchQuery ? 'No products found' : 'No products available'}
                    </h2>
                    <p className="no-products-message">
                        {searchQuery
                            ? `No products match "${searchQuery}". Try a different search.`
                            : fetchAll
                                ? 'No products are available in the catalog.'
                                : 'You haven\'t added any products yet.'}
                    </p>
                    {!searchQuery && (
                        <Link to="/products" className="shop-now-button">
                            Add Your First Product
                        </Link>
                    )}
                </div>
            ) : (
                <div className="products-grid">
                    {filteredProducts.map((p) => (
                        <ProductCard key={p._id} product={p} />
                    ))}
                </div>
            )}
        </div>
    );

}
