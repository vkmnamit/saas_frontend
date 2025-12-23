import "./App.css";
import About from "./assets/About_us.jsx";
import Home from "./assets/Home.jsx";
import Services from './assets/Services.jsx'
import ContactUs from "./assets/Contact_us.jsx";
import SignUpPage from "./assets/signup_working.jsx";
import SignInPage from "./assets/sign_in.jsx";
import Dashboard from "./assets/Dashboard.jsx";
import Product from "./assets/Product.jsx";
import ProductOrder from "./assets/ProductOrder.jsx";
import AddToCart from "./AddToCart.jsx";
import Cart from "./Cart.jsx";
import PaymentGateway from './assets/PaymentGateway';
import Invoice from './assets/Invoice';
import Analytics from "./Analytics.jsx";
import Stock from "./Stock.jsx";
import Setup from "./Setup.jsx";
import Settings from './assets/Settings';
import BulkProductUpload from './assets/BulkUpload';
import OrderHistory from './assets/OrderHistory';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products/upload" element={<BulkProductUpload />} />
                <Route path="/products" element={<Product />} />
                <Route path="/product-order" element={<ProductOrder />} />
                <Route path="/AddToCart/:productId" element={<AddToCart />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/payment" element={<PaymentGateway />} />
                <Route path="/invoice/:invoiceId" element={<Invoice />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/stock" element={<Stock />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/orders" element={<OrderHistory />} />
            </Routes>
        </Router>
    );
}

export default App;

