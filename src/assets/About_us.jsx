import React from "react";
import "./About_us.css";

function AboutUs() {
    return (
        <div>
            <section className="about-section">
                <div className="about-inner">
                    <h2 className="about-title">We empower merchants with a smarter SaaS ecosystem</h2>
                    <p className="about-lead">
                        We are a SaaS-based ecosystem built to empower merchants with smarter business management. Our
                        platform provides everything in one place — from <strong>real-time stock alerts</strong> and
                        <strong> automated invoicing</strong> to <strong>daily, weekly & yearly analytics</strong>.
                    </p>

                    <ul className="about-features">
                        <li><span className="feature-strong">Inventory Alerts</span> — instant notifications when stock runs low.</li>
                        <li><span className="feature-strong">Invoices & Analytics</span> — easy invoices and clear graphs for trends.</li>
                        <li><span className="feature-strong">Payments & GST</span> — integrated payments and GST compliance tools.</li>
                        <li><span className="feature-strong">Cash Flow Control</span> — see and manage your finances with confidence.</li>
                    </ul>

                    <div className="about-cta-row">
                        <p className="about-mission">Our mission: simplify complexity so merchants can focus on growth.</p>
                        <a href="/signup" className="btn-primary" style={{ background: "black" }}>Get Started</a>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default AboutUs;        