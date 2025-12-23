import { useEffect, useState } from "react";
import './Analytics.css';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState('weekly'); // 'weekly', 'monthly', 'yearly'
    const [graphMetric, setGraphMetric] = useState('totalOrders'); // 'totalOrders', 'totalOrderValue'
    const [chartType, setChartType] = useState('weeklyTimeSeries');
    const [isRealTime, setIsRealTime] = useState(true);
    const [invoiceData, setInvoiceData] = useState(null);
    const [userId, setUserId] = useState(null);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch('http://localhost:5002/api/users/profile', {
                method: 'GET',
                credentials: 'include',
            });
            if (res.ok) {
                const userData = await res.json();
                setUserId(userData._id || userData.user?._id);
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const url = userId
                ? `http://localhost:5002/api/analytics?userId=${userId}`
                : 'http://localhost:5002/api/analytics';
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (res.status === 401) {
                window.location.href = '/signin';
                return;
            }
            const result = await res.json();
            if (res.ok) {
                setData(result);
            } else {
                setError(result.message || 'Failed to fetch analytics data');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        }
    };

    const fetchInvoiceAnalytics = async () => {
        if (!userId) return;

        try {
            const res = await fetch(`http://localhost:5002/api/invoices/analytics/${userId}`, {
                method: 'GET',
                credentials: 'include',
            });
            if (res.ok) {
                const result = await res.json();
                if (result.success) {
                    setInvoiceData(result.analytics);
                }
            }
        } catch (err) {
            console.error('Failed to fetch invoice analytics:', err);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        fetchAnalytics();

        // Set up real-time updates every 30 seconds
        let interval;
        if (isRealTime) {
            interval = setInterval(fetchAnalytics, 15000);
        }


        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRealTime]);

    useEffect(() => {
        if (userId) {
            fetchInvoiceAnalytics();

            // Also refresh invoice data periodically if real-time is enabled
            let interval;
            if (isRealTime) {
                interval = setInterval(fetchInvoiceAnalytics, 30000);
            }

            return () => {
                if (interval) clearInterval(interval);
            };
        }
    }, [userId, isRealTime]);

    const renderTimeSeriesChart = (timeSeriesData, metric = 'totalOrders') => {
        if (!timeSeriesData || timeSeriesData.length === 0) return null;

        const chartHeight = 250;
        const chartWidth = 600;
        const padding = 60;
        const data = timeSeriesData.map(d => d[metric] || 0);
        const maxValue = Math.max(...data, 1);
        const minValue = Math.min(...data, 0);

        return (
            <svg width={chartWidth} height={chartHeight} className="line-chart">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <line
                        key={i}
                        x1={padding}
                        y1={padding + ratio * (chartHeight - 2 * padding)}
                        x2={chartWidth - padding}
                        y2={padding + ratio * (chartHeight - 2 * padding)}
                        className="chart-grid"
                    />
                ))}

                {/* Y-axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <text
                        key={i}
                        x={padding - 10}
                        y={padding + ratio * (chartHeight - 2 * padding) + 5}
                        className="chart-value-label"
                        textAnchor="end"
                    >
                        {Math.round(maxValue * (1 - ratio))}
                    </text>
                ))}

                {/* Data line */}
                <polyline
                    points={data.map((value, i) => {
                        const x = padding + (i * (chartWidth - 2 * padding)) / (data.length - 1);
                        const y = chartHeight - padding - ((value - minValue) / (maxValue - minValue)) * (chartHeight - 2 * padding);
                        return `${x},${y}`;
                    }).join(' ')}
                    className="chart-line"
                    stroke="#1a1a1a"
                    strokeWidth="3"
                />

                {/* Data points */}
                {data.map((value, i) => {
                    const x = padding + (i * (chartWidth - 2 * padding)) / (data.length - 1);
                    const y = chartHeight - padding - ((value - minValue) / (maxValue - minValue)) * (chartHeight - 2 * padding);
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            className="chart-point"
                            title={`${timeSeriesData[i].week || timeSeriesData[i].day}: ${value}`}
                        />
                    );
                })}

                {/* X-axis labels */}
                {timeSeriesData.map((d, i) => {
                    const x = padding + (i * (chartWidth - 2 * padding)) / (timeSeriesData.length - 1);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={chartHeight - 20}
                            className="chart-label"
                            textAnchor="middle"
                        >
                            {d.week || d.day?.split('-')[2] || i + 1}
                        </text>
                    );
                })}
            </svg>
        );
    };

    if (error) {
        return (
            <div className="analytics-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="analytics-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading analytics...
                </div>
            </div>
        );
    }

    const currentPeriodData = data[activeTab] || { totalOrders: 0, totalOrderValue: 0, activeUsers: 0 };

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h1 className="analytics-title">Analytics Dashboard</h1>
                <p className="analytics-subtitle">Track your business performance and growth</p>
            </div>

            <div className="analytics-cards">
                <div className="analytics-card">
                    <div className="card-header">
                        <h3 className="card-title">Total Orders</h3>
                        <span className="card-icon">📦</span>
                    </div>
                    <div className="card-value">{data.totalOrders || 0}</div>
                    <p className="card-label">Total processed orders</p>
                </div>

                <div className="analytics-card">
                    <div className="card-header">
                        <h3 className="card-title">Total Payments</h3>
                        <span className="card-icon">💰</span>
                    </div>
                    <div className="card-value">₹{(data.totalOrderValue || 0).toLocaleString()}</div>
                    <p className="card-label">Overall revenue received</p>
                </div>

                <div className="analytics-card">
                    <div className="card-header">
                        <h3 className="card-title">Active Users</h3>
                        <span className="card-icon">👥</span>
                    </div>
                    <div className="card-value">{data.activeUsers || 0}</div>
                    <p className="card-label">Total registerd users</p>
                </div>

                <div className="analytics-card">
                    <div className="card-header">
                        <h3 className="card-title">Total Products</h3>
                        <span className="card-icon">🛍️</span>
                    </div>
                    <div className="card-value">{data.totalProducts || 0}</div>
                    <p className="card-label">Products in catalog</p>
                </div>

                <div className="analytics-card">
                    <div className="card-header">
                        <h3 className="card-title">Cart Items</h3>
                        <span className="card-icon">🛒</span>
                    </div>
                    <div className="card-value">{data.totalCartItems || 0}</div>
                    <p className="card-label">Items in carts</p>
                </div>

                <div className="analytics-card">
                    <div className="card-header">
                        <h3 className="card-title">Last Updated</h3>
                        <span className="card-icon">🔄</span>
                    </div>
                    <div className="card-value" style={{ fontSize: '0.9rem' }}>
                        {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'N/A'}
                    </div>
                    <p className="card-label">Real-time data</p>
                </div>
            </div>

            {/* Live Activity Feed */}
            {data.recentInvoices && data.recentInvoices.length > 0 && (
                <div className="live-activity-section">
                    <div className="section-header">
                        <h2 className="section-title">⚡ Live Activity Feed</h2>
                        <div className="live-count-badge">
                            <span className="live-dot"></span>
                            Latest Transactions
                        </div>
                    </div>
                    <div className="activity-list">
                        {data.recentInvoices.map((invoice, idx) => (
                            <div key={invoice._id} className="activity-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="activity-time">
                                    {new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="activity-main">
                                    <span className="activity-user">{invoice.customerName}</span>
                                    <span className="activity-action">placed a new order</span>
                                    <span className="activity-ref">{invoice.invoiceNumber}</span>
                                </div>
                                <div className="activity-amount">
                                    +₹{invoice.totalAmount.toLocaleString()}
                                </div>
                                <div className="activity-status-dot"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Invoice Analytics Section */}
            {invoiceData && (
                <div className="invoice-analytics-section">
                    <div className="section-header">
                        <h2 className="section-title">💳 Payment & Invoice Analytics</h2>
                        <p className="section-subtitle">Track your revenue and invoice history</p>
                    </div>

                    <div className="analytics-cards">
                        <div className="analytics-card invoice-card">
                            <div className="card-header">
                                <h3 className="card-title">Total Revenue</h3>
                                <span className="card-icon">💰</span>
                            </div>
                            <div className="card-value">
                                ₹{invoiceData.summary.totalRevenue?.toLocaleString('en-IN') || 0}
                            </div>
                            <p className="card-label">From all invoices</p>
                        </div>

                        <div className="analytics-card invoice-card">
                            <div className="card-header">
                                <h3 className="card-title">Total Invoices</h3>
                                <span className="card-icon">📄</span>
                            </div>
                            <div className="card-value">{invoiceData.summary.totalInvoices || 0}</div>
                            <p className="card-label">Invoices generated</p>
                        </div>

                        <div className="analytics-card invoice-card">
                            <div className="card-header">
                                <h3 className="card-title">Average Invoice</h3>
                                <span className="card-icon">📊</span>
                            </div>
                            <div className="card-value">
                                ₹{Math.round(invoiceData.summary.averageInvoice || 0).toLocaleString('en-IN')}
                            </div>
                            <p className="card-label">Average value</p>
                        </div>

                        <div className="analytics-card invoice-card">
                            <div className="card-header">
                                <h3 className="card-title">Paid Invoices</h3>
                                <span className="card-icon">✅</span>
                            </div>
                            <div className="card-value">
                                {invoiceData.statusBreakdown.find(s => s._id === 'paid')?.count || 0}
                            </div>
                            <p className="card-label">Successfully paid</p>
                        </div>
                    </div>

                    {/* Recent Invoices */}
                    {invoiceData.recentInvoices && invoiceData.recentInvoices.length > 0 && (
                        <div className="recent-invoices">
                            <h3 className="subsection-title">📋 Recent Invoices</h3>
                            <div className="invoice-list">
                                {invoiceData.recentInvoices.map((invoice) => (
                                    <div key={invoice._id} className="invoice-item">
                                        <div className="invoice-details">
                                            <span className="invoice-number">{invoice.invoiceNumber}</span>
                                            <span className="invoice-date">
                                                {new Date(invoice.createdAt).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="invoice-right">
                                            <span className="invoice-amount">
                                                ₹{invoice.totalAmount.toLocaleString('en-IN')}
                                            </span>
                                            <span className={`invoice-status status-${invoice.status}`}>
                                                {invoice.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Monthly Revenue Chart */}
                    {invoiceData.monthlyRevenue && invoiceData.monthlyRevenue.length > 0 && (
                        <div className="monthly-revenue-chart">
                            <h3 className="subsection-title">📈 Monthly Revenue Trend</h3>
                            <div className="revenue-bars">
                                {invoiceData.monthlyRevenue.slice(0, 6).reverse().map((month, index) => {
                                    const maxRevenue = Math.max(...invoiceData.monthlyRevenue.map(m => m.revenue));
                                    const heightPercent = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                                    const monthName = new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

                                    return (
                                        <div key={index} className="revenue-bar-wrapper">
                                            <div className="revenue-bar-container">
                                                <div
                                                    className="revenue-bar"
                                                    style={{ height: `${heightPercent}%` }}
                                                    title={`₹${month.revenue.toLocaleString('en-IN')}`}
                                                >
                                                    <span className="bar-value">₹{(month.revenue / 1000).toFixed(1)}k</span>
                                                </div>
                                            </div>
                                            <span className="revenue-bar-label">{monthName}</span>
                                            <span className="revenue-bar-count">{month.count} invoices</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="chart-container">
                <div className="chart-header">
                    <div>
                        <h2 className="chart-title">Real-Time Performance Trends</h2>
                        <p className="chart-subtitle">Time series analysis of your key metrics</p>
                    </div>
                    <div className="chart-filters">
                        <button
                            className={`filter-button ${isRealTime ? 'active' : ''}`}
                            onClick={() => setIsRealTime(!isRealTime)}
                        >
                            {isRealTime ? '🔄 Live' : '⏸️ Paused'}
                        </button>
                        <button
                            className={`filter-button ${chartType === 'weeklyTimeSeries' ? 'active' : ''}`}
                            onClick={() => setChartType('weeklyTimeSeries')}
                        >
                            Weekly
                        </button>
                        <button
                            className={`filter-button ${chartType === 'dailyTimeSeries' ? 'active' : ''}`}
                            onClick={() => setChartType('dailyTimeSeries')}
                        >
                            Daily
                        </button>
                        <select
                            value={graphMetric}
                            onChange={(e) => setGraphMetric(e.target.value)}
                            className="filter-button"
                            style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}
                        >
                            <option value="totalOrders">Orders</option>
                            <option value="totalOrderValue">Revenue</option>
                        </select>
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="filter-button"
                            style={{ background: '#000', color: '#fff' }}
                        >
                            <option value="weekly">Weekly View</option>
                            <option value="monthly">Monthly View</option>
                            <option value="yearly">Yearly View</option>
                        </select>
                    </div>
                </div>
                <div className="chart-content">
                    {data && data[chartType] && data[chartType].length > 0 ? (
                        renderTimeSeriesChart(data[chartType], graphMetric)
                    ) : (
                        <div className="chart-placeholder">
                            <div className="chart-placeholder-icon">📊</div>
                            <h3 className="chart-placeholder-text">No Time Series Data</h3>
                            <p className="chart-placeholder-subtext">Start selling to see your trends</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Products Section */}
            {data.topProducts && data.topProducts.length > 0 && (
                <div className="top-products-section">
                    <div className="section-header">
                        <h2 className="section-title">🏆 Top Performing Products</h2>
                        <p className="section-subtitle">Products bringing in the most revenue</p>
                    </div>
                    <div className="top-products-list">
                        {data.topProducts.map((product, index) => (
                            <div key={index} className="top-product-row">
                                <div className="rank">#{index + 1}</div>
                                <div className="product-info-main">
                                    <span className="product-name">{product.name}</span>
                                    <span className="product-sold">{product.sold} units sold</span>
                                </div>
                                <div className="product-revenue">
                                    <span className="revenue-value">₹{product.revenue?.toLocaleString()}</span>
                                    <div className="revenue-bar-bg">
                                        <div
                                            className="revenue-bar-fill"
                                            style={{
                                                width: `${(product.revenue / data.topProducts[0].revenue) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="period-comparison">
                <div className="comparison-header">
                    <h2 className="comparison-title">Live Period Comparison</h2>
                    <div className="live-indicator">
                        <span className="live-dot"></span>
                        <span>Live Data</span>
                    </div>
                </div>
                <div className="period-grid">
                    {Object.entries(data).filter(([key]) =>
                        ['weekly', 'monthly', 'threeMonthly', 'sixMonthly', 'yearly'].includes(key)
                    ).map(([period, periodData]) => (
                        <div key={period} className="period-card">
                            <div className="period-card-header">
                                <h3 className="period-name">
                                    {period === 'threeMonthly' ? '3 Months' :
                                        period === 'sixMonthly' ? '6 Months' :
                                            period.charAt(0).toUpperCase() + period.slice(1)}
                                </h3>
                                <div className="period-trend">
                                    {periodData.totalOrders > 0 && (
                                        <span className="trend-indicator positive">↗</span>
                                    )}
                                </div>
                            </div>
                            <div className="period-stats">
                                <div className="period-stat">
                                    <span className="period-stat-label">Orders:</span>
                                    <span className="period-stat-value">{periodData.totalOrders}</span>
                                </div>
                                <div className="period-stat">
                                    <span className="period-stat-label">Revenue:</span>
                                    <span className="period-stat-value">₹{periodData.totalOrderValue}</span>
                                </div>
                                <div className="period-stat">
                                    <span className="period-stat-label">Users:</span>
                                    <span className="period-stat-value">{periodData.activeUsers}</span>
                                </div>
                                <div className="period-stat">
                                    <span className="period-stat-label">Avg/Order:</span>
                                    <span className="period-stat-value">
                                        ₹{periodData.totalOrders > 0 ? Math.round(periodData.totalOrderValue / periodData.totalOrders) : 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
