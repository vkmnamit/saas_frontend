import React from "react";
import "./Services.css";
import { Link } from "react-router-dom";

function Services() {
    return (
        <div>
            <section className="services-section">
                <div className="services-inner">
                    <h2 className="services-title">Our Services</h2>
                    <p className="services-lead">
                        Comprehensive SaaS solutions designed to streamline your business operations
                        and drive growth through intelligent automation and analytics.
                    </p>

                    <div className="services-grid">
                        <div className="service-card">
                            <div className="service-icon">📊</div>
                            <h3>Real-Time Analytics</h3>
                            <p>Get instant insights into your business performance with comprehensive dashboards and reporting tools.</p>
                            <ul>
                                <li>Daily, weekly, and monthly reports</li>
                                <li>Custom dashboard creation</li>
                                <li>Data visualization tools</li>
                                <li>Performance metrics tracking</li>
                            </ul>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">📦</div>
                            <h3>Inventory Management</h3>
                            <p>Smart inventory tracking with automated alerts and optimization recommendations.</p>
                            <ul>
                                <li>Low stock notifications</li>
                                <li>Automated reorder points</li>
                                <li>Supplier management</li>
                                <li>Stock level optimization</li>
                            </ul>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">💰</div>
                            <h3>Financial Management</h3>
                            <p>Complete financial oversight with automated invoicing and payment processing.</p>
                            <ul>
                                <li>Automated invoice generation</li>
                                <li>Payment tracking</li>
                                <li>GST compliance tools</li>
                                <li>Cash flow management</li>
                            </ul>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">🤖</div>
                            <h3>Business Automation</h3>
                            <p>Streamline repetitive tasks with intelligent automation workflows.</p>
                            <ul>
                                <li>Workflow automation</li>
                                <li>Task scheduling</li>
                                <li>Email notifications</li>
                                <li>Process optimization</li>
                            </ul>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">📱</div>
                            <h3>Mobile Access</h3>
                            <p>Access your business data anywhere with our mobile-responsive platform.</p>
                            <ul>
                                <li>Mobile-optimized interface</li>
                                <li>Offline data sync</li>
                                <li>Push notifications</li>
                                <li>Cross-device compatibility</li>
                            </ul>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">🔒</div>
                            <h3>Security & Compliance</h3>
                            <p>Enterprise-grade security with comprehensive compliance management.</p>
                            <ul>
                                <li>Data encryption</li>
                                <li>Access controls</li>
                                <li>Compliance reporting</li>
                                <li>Backup & recovery</li>
                            </ul>
                        </div>
                    </div>

                    <div className="services-cta">
                        <h3>Ready to Transform Your Business?</h3>
                        <p>Get started with our comprehensive SaaS solution today and see the difference it makes.</p>
                        <Link to="/signup" className="btn-primary" style={{ background: "black" }}>Get Started Now</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Services;