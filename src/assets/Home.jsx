import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../home.css";

function Home() {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleClick = (event) => {
            const navMenu = document.querySelector(".nav-menu");
            const hamburger = document.querySelector(".hamburger");

            if (
                navMenu &&
                hamburger &&
                !hamburger.contains(event.target) &&
                !navMenu.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    return (
        <>
            {/* Navbar */}
            <nav className="header">
                <img src="/logo1.jpg" alt="Logo" />

                <div className={`nav-menu ${menuOpen ? "active" : ""}`}>
                    <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
                    <Link to="/services" onClick={() => setMenuOpen(false)}>Services</Link>
                    <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
                    <Link to="/signup" onClick={() => setMenuOpen(false)} className="signup-nav-link" >Sign Up</Link>
                </div>

               
            </nav>

            {/* Hero */}    
            <section className="hero">
                <div className="hero-left">
                    <h1>Empower Your Business with Data-Driven Insights</h1>
                    <p>
                        Unlock the potential of your business with our cutting-edge
                        analytics platform. Make informed decisions, optimize operations,
                        and drive growth with ease.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/signup"><button className="get-started">Get Started</button></Link>
                        <Link to="/about"><button className="learn-more">Learn More</button></Link>
                    </div>
                </div>

            </section>


            {/* Insights */}
            <div className="insight">
                <h1>Insights</h1>
                <div className="card">
                    <span>
                        <h2>Reporting</h2>
                        <p>
                            Analyze weekly, monthly, and yearly trends to gain insights into
                            your business performance.
                        </p>
                        <Link to="/services"><button>Discover How</button></Link>
                    </span>
                    <span>
                        <h2>Optimization</h2>
                        <p>
                            Optimize your business processes and strategies based on
                            data-driven insights.
                        </p>
                        <Link to="/about"><button>Explore Plans</button></Link>
                    </span>
                    <span>
                        <h2>Alert</h2>
                        <p>
                            Optimize operation with recommendations tailored to your business
                            needs.
                        </p>
                        <Link to="/signup"><button>Join Now</button></Link>
                    </span>
                    <span>
                        <h2>Graph</h2>
                        <p>
                            Visualize your data with interactive graphs and charts for better
                            insights.
                        </p>
                        <Link to="/services"><button>See Benefits</button></Link>
                    </span>
                </div>
            </div>

            {/* Performance */}
            <section className="insights">
                <div>
                    <h2>Performance Insights</h2>
                    <p style={{ marginTop: "20px" }}>
                        Track your business performance with comprehensive analysis tools
                        that provide a clear view.
                    </p>

                    <div className="insight-grid">
                        <div className="insight-item">
                            <h3>Monthly</h3>
                            <p>User-Friendly</p>
                        </div>
                        <div className="insight-item">
                            <h3>Yearly</h3>
                            <p>Efficient</p>
                        </div>
                        <div className="insight-item">
                            <h3>Real-Time</h3>
                            <p>Informed</p>
                        </div>
                        <div className="insight-item">
                            <h3>Actionable</h3>
                            <p>Tailored</p>
                        </div>
                    </div>
                </div>
                <div className="insight_right">
                    <img src="/graph-5459687_960_720.webp" alt="Graph" />
                </div>
            </section>

            {/* Contact */}
            <section>
                <div className="contact">
                    <div className="contact_left">
                        <h1 style={{ fontSize: "40px" }}>Get in Touch</h1>
                        <img src="/AWZtN.png" alt="Contact" style={{ paddingTop: "120px", paddingRight: "50px" }} />
                    </div>

                    <div className="contact_right">
                        <p style={{ fontSize: "30px" }}>We're here to Help</p>
                        <p style={{ fontSize: "20px" }}>
                            Contact us for inquiries, feedback, or support. We look forward to
                            assisting you!
                        </p>


                        <div
                            style={{
                                marginBottom: "20px",
                                marginTop: "90px",
                                fontSize: "30px",
                            }}
                        >
                            Contact Us
                        </div>
                        <div className="information">
                            <div>
                                First name
                                <input type="text" placeholder="First Name" />
                            </div>
                            <div>
                                Last Name
                                <input type="text" placeholder="Last name" />
                            </div>
                            <div>
                                Email*
                                <input type="text" placeholder="Email" />
                            </div>
                            <div>
                                Phone
                                <input type="text" placeholder="Phone" />
                            </div>
                            <div>
                                Message*
                                <input type="text" placeholder="Message" />
                            </div>
                            <div>
                                <Link to="/message"><button>Submit</button></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews */}
            <section>
                <div className="final">
                    <div>
                        <h3
                            style={{
                                fontSize: "60px",
                                marginLeft: "80px",
                                marginBottom: "40px",
                                justifyContent: "center",
                            }}
                        >
                            What our clients Say
                        </h3>
                        <div className="review">
                            <img src="/download.jpg" alt="Client 1" />
                            <img src="/download (1).jpg" alt="Client 2" />
                            <img src="/images.jpg" alt="Client 3" />
                        </div>
                        <div className="thought">
                            <p>
                                Raj Patel: "The analytics helped me grow my business
                                significantly"
                            </p>
                            <p>
                                Lila Santos: "Exceptional tools and insights for my eCommerce
                                needs."
                            </p>
                            <p>
                                Lana: "The alert feature is the game-changer for managing stock"
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer>
                <p>&copy; 2025 Mercanto. All rights reserved.</p>
            </footer>
        </>
    );
}

export default Home;
