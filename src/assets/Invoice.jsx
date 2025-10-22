import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Invoice.css';

const Invoice = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInvoice();
    }, [invoiceId]);

    const fetchInvoice = async () => {
        try {
            const response = await fetch(`http://localhost:5002/api/invoices/${invoiceId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch invoice');
            }

            const data = await response.json();
            if (data.success) {
                setInvoice(data.invoice);
            } else {
                setError(data.message || 'Failed to load invoice');
            }
        } catch (err) {
            console.error('Error fetching invoice:', err);
            setError('Failed to load invoice. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        // Simple print to PDF (browser's print dialog)
        window.print();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="invoice-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="invoice-container">
                <div className="error-message">
                    <h2>❌ Error</h2>
                    <p>{error || 'Invoice not found'}</p>
                    <button onClick={() => navigate('/dashboard')} className="btn-back">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="invoice-wrapper">
            <div className="invoice-actions no-print">
                <button onClick={() => navigate(-1)} className="btn-action">
                    ← Back
                </button>
                <div className="action-buttons">
                    <button onClick={handlePrint} className="btn-action btn-print">
                        🖨️ Print
                    </button>
                    <button onClick={handleDownloadPDF} className="btn-action btn-download">
                        📄 Download PDF
                    </button>
                </div>
            </div>

            <div className="invoice-container" id="invoice-content">
                {/* Header */}
                <div className="invoice-header">
                    <div className="company-info">
                        <h1>VKM SOLUTIONS</h1>
                        <p>Premium SaaS Platform</p>
                        <p>Email: support@vkmsolutions.com</p>
                        <p>Phone: +91 98765 43210</p>
                    </div>
                    <div className="invoice-meta">
                        <h2>INVOICE</h2>
                        <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                        <p><strong>Date:</strong> {formatDate(invoice.createdAt)}</p>
                        <p><strong>Status:</strong> <span className={`status-badge status-${invoice.status}`}>{invoice.status.toUpperCase()}</span></p>
                    </div>
                </div>

                <hr className="divider" />

                {/* Customer Details */}
                <div className="invoice-details">
                    <div className="bill-to">
                        <h3>Bill To:</h3>
                        <p><strong>{invoice.customerName}</strong></p>
                        <p>{invoice.customerEmail}</p>
                        <p>{invoice.customerContact}</p>
                        {invoice.billingAddress && invoice.billingAddress.street && (
                            <div className="address">
                                <p>{invoice.billingAddress.street}</p>
                                <p>{invoice.billingAddress.city}, {invoice.billingAddress.state} {invoice.billingAddress.zipCode}</p>
                                <p>{invoice.billingAddress.country}</p>
                            </div>
                        )}
                    </div>
                    <div className="payment-info">
                        <h3>Payment Details:</h3>
                        <p><strong>Payment ID:</strong> {invoice.paymentDetails.razorpayPaymentId}</p>
                        <p><strong>Order ID:</strong> {invoice.paymentDetails.razorpayOrderId}</p>
                        <p><strong>Method:</strong> {invoice.paymentDetails.paymentMethod.toUpperCase()}</p>
                        <p><strong>Paid Date:</strong> {formatDate(invoice.paidDate)}</p>
                        <p className="payment-status">
                            <strong>Status:</strong> <span className="status-success">✓ {invoice.paymentDetails.paymentStatus.toUpperCase()}</span>
                        </p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="invoice-items">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product / Service</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.productName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.price)}</td>
                                    <td>{formatCurrency(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="invoice-totals">
                    <div className="totals-row">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.tax > 0 && (
                        <div className="totals-row">
                            <span>Tax:</span>
                            <span>{formatCurrency(invoice.tax)}</span>
                        </div>
                    )}
                    {invoice.discount > 0 && (
                        <div className="totals-row discount">
                            <span>Discount:</span>
                            <span>-{formatCurrency(invoice.discount)}</span>
                        </div>
                    )}
                    <hr />
                    <div className="totals-row total">
                        <span><strong>Total Amount:</strong></span>
                        <span><strong>{formatCurrency(invoice.totalAmount)}</strong></span>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="invoice-notes">
                        <h3>Notes:</h3>
                        <p>{invoice.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="invoice-footer">
                    <p>Thank you for your business!</p>
                    <p className="footer-note">This is a computer-generated invoice and does not require a signature.</p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
