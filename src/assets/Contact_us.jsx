import React from "react";
import "./Contact_us.css";

function ContactUs() {
    return (
        <div>
            <section className="contact-section">
                <div className="contact-inner">
                    <h2 className="contact-title">Get in Touch</h2>
                    <p className="contact-lead">
                        Have questions about our services? Want to discuss your business needs?
                        We'd love to hear from you! Reach out through any of the channels below.
                    </p>

                    <div className="contact-grid">
                        <div className="contact-info">
                            <h3>Contact Information</h3>

                            <div className="contact-item">
                                <div className="contact-icon">📧</div>
                                <div className="contact-details">
                                    <h4>Email</h4>
                                    <a href="mailto:vkmnamit@gmail.com">vkmnamit@gmail.com</a>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">📱</div>
                                <div className="contact-details">
                                    <h4>Instagram</h4>
                                    <a href="https://instagram.com/vkmnamit" target="_blank" rel="noopener noreferrer">@vkmnamit</a>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">💬</div>
                                <div className="contact-details">
                                    <h4>Telegram</h4>
                                    <a href="https://t.me/vkmnamit" target="_blank" rel="noopener noreferrer">@vkmnamit</a>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">🐦</div>
                                <div className="contact-details">
                                    <h4>Twitter</h4>
                                    <a href="https://twitter.com/vkmnamit" target="_blank" rel="noopener noreferrer">@vkmnamit</a>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">💼</div>
                                <div className="contact-details">
                                    <h4>LinkedIn</h4>
                                    <a href="https://linkedin.com/in/vkmnamit" target="_blank" rel="noopener noreferrer">vkmnamit</a>
                                </div>
                            </div>
                        </div>

                        <div className="contact-form">
                            <h3>Send us a Message</h3>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <input type="text" id="name" name="name" required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input type="email" id="email" name="email" required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Subject</label>
                                    <input type="text" id="subject" name="subject" required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea id="message" name="message" rows="5" required></textarea>
                                </div>

                                <button type="submit" className="btn-primary" style={{ background: "black" }}>Send Message</button>
                            </form>
                        </div>
                    </div>

                    <div className="contact-cta">
                        <h3>Ready to Transform Your Business?</h3>
                        <p>Let's discuss how our SaaS solutions can help streamline your operations and drive growth.</p>
                        <a href="mailto:vkmnamit@gmail.com" className="btn-secondary">Schedule a Call</a>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ContactUs;
