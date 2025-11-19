import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentGateway.css';

const PaymentGateway = () => {
    const [amount, setAmount] = useState(500);
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const navigate = useNavigate();

    // Load Razorpay script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    useEffect(() => {
        loadRazorpayScript();
    }, []);

    // Detect internet connection status
    useEffect(() => {
        const handleOffline = () => {
            setPaymentStatus('');
            alert('⚠️ No internet connection detected!\n\nPlease check your connection and try again.');
            console.warn('Internet connection lost');
        };
        
        const handleOnline = () => {
            console.log('✅ Internet connection restored');
        };
        
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    const handlePayment = async () => {
        // Check internet connection before proceeding
        if (!navigator.onLine) {
            alert('⚠️ No internet connection!\n\nPlease connect to the internet and try again.');
            return;
        }
        if (!amount || amount < 1) {
            alert('Please enter a valid amount (minimum ₹1)');
            return;
        }

        setLoading(true);
        setPaymentStatus('');

        try {
            // Load Razorpay script if not loaded
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                alert('Failed to load Razorpay SDK. Please check your internet connection.');
                setLoading(false);
                return;
            }

            // Step 1: Create order on backend
            console.log('Creating order for amount:', amount);

            const orderResponse = await fetch('http://localhost:5003/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`
                }),
            });

            if (!orderResponse.ok) {
                throw new Error(`Failed to create order. Server returned ${orderResponse.status}`);
            }

            const orderData = await orderResponse.json();
            console.log('Order created successfully:', orderData);

            if (!orderData.success) {
                throw new Error(orderData.message || 'Failed to create order');
            }

            if (!orderData.order || !orderData.order.id) {
                throw new Error('Invalid order data received from server');
            }

            // Step 2: Configure Razorpay options
            console.log('Configuring Razorpay with order:', orderData.order);

            const options = {
                key: 'rzp_test_RSy5sbSpCkYCqq', // ⚠️ Replace with your Razorpay Key ID
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: 'Vkm Solutions',
                description: 'Product Purchase',
                order_id: orderData.order.id,
                handler: async function (response) {
                    // Step 3: Verify payment on backend
                    try {
                        console.log('Payment response from Razorpay:', {
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature ? 'Present' : 'Missing'
                        });

                        const verifyResponse = await fetch('http://localhost:5003/api/payment/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        if (!verifyResponse.ok) {
                            throw new Error(`Verification request failed with status ${verifyResponse.status}`);
                        }

                        const verifyData = await verifyResponse.json();
                        console.log('Verification response:', verifyData);

                        if (verifyData.success) {
                            // Step 4: Create Invoice after successful payment
                            try {
                                console.log('Creating invoice...');
                                const invoiceResponse = await fetch('http://localhost:5002/api/invoices/create', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        userId: localStorage.getItem('userId') || '000000000000000000000000',
                                        customerName: 'Test Customer', // Replace with actual user data
                                        customerEmail: 'test@example.com',
                                        customerContact: '9876543210',
                                        items: [{
                                            productName: 'Product Purchase',
                                            quantity: 1,
                                            price: amount,
                                            subtotal: amount
                                        }],
                                        subtotal: amount,
                                        tax: 0,
                                        discount: 0,
                                        totalAmount: amount,
                                        paymentDetails: {
                                            razorpayOrderId: response.razorpay_order_id,
                                            razorpayPaymentId: response.razorpay_payment_id,
                                            razorpaySignature: response.razorpay_signature,
                                            paymentMethod: 'razorpay',
                                            paymentStatus: 'paid'
                                        },
                                        notes: 'Payment via Razorpay'
                                    }),
                                });

                                if (invoiceResponse.ok) {
                                    const invoiceData = await invoiceResponse.json();
                                    console.log('✅ Invoice created:', invoiceData);

                                    setPaymentStatus('success');
                                    setLoading(false);
                                    alert(`✅ Payment Successful! 🎉\n\nPayment ID: ${verifyData.paymentId}\nOrder ID: ${verifyData.orderId}\nInvoice Number: ${invoiceData.invoice.invoiceNumber}`);

                                    // Navigate to invoice page
                                    navigate(`/invoice/${invoiceData.invoice.id}`);
                                } else {
                                    console.warn('Failed to create invoice, but payment was successful');
                                    setPaymentStatus('success');
                                    setLoading(false);
                                    alert(`✅ Payment Successful! 🎉\n\nPayment ID: ${verifyData.paymentId}\nOrder ID: ${verifyData.orderId}\n\n⚠️ Invoice generation pending`);
                                }
                            } catch (invoiceError) {
                                console.error('Invoice creation error:', invoiceError);
                                // Payment was successful, just invoice creation failed
                                setPaymentStatus('success');
                                setLoading(false);
                                alert(`✅ Payment Successful! 🎉\n\nPayment ID: ${verifyData.paymentId}\nOrder ID: ${verifyData.orderId}\n\n⚠️ Invoice will be generated shortly`);
                            }
                        } else {
                            setPaymentStatus('failed');
                            setLoading(false);
                            alert(`❌ Payment verification failed!\n${verifyData.message || 'Unknown error'}`);
                        }
                    } catch (error) {
                        console.error('Verification error details:', {
                            message: error.message,
                            stack: error.stack
                        });
                        setPaymentStatus('failed');
                        setLoading(false);
                        alert(`❌ Payment verification failed!\n${error.message}`);
                    }
                },
                prefill: {
                    name: 'Test Customer',
                    email: 'test@example.com',
                    contact: '9876543210',  // Must be 10 digits
                },
                notes: {
                    address: 'Test Address',
                    merchant_order_id: `order_${Date.now()}`,
                },
                theme: {
                    color: '#000000',  // Fixed: Removed extra 'ff'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        setPaymentStatus('cancelled');
                        alert('Payment cancelled');
                    }
                }
            };

            // Step 4: Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response) {
                setPaymentStatus('failed');
                setLoading(false);

                // Detailed error logging - expanded to see full error object
                console.error('=== RAZORPAY PAYMENT FAILED ===');
                console.error('Full Error Response:', response);
                console.error('Error Object:', response.error);
                console.error('Error Details:', {
                    code: response.error.code,
                    description: response.error.description,
                    source: response.error.source,
                    step: response.error.step,
                    reason: response.error.reason,
                    metadata: response.error.metadata,
                    field: response.error.field || 'N/A',
                    http_status_code: response.error.http_status_code || 'N/A'
                });
                console.error('=================================');

                alert(`❌ Payment Failed!\n\nCode: ${response.error.code || 'Unknown'}\nReason: ${response.error.description || 'Unknown error'}\nStep: ${response.error.step || 'N/A'}`);
            });

            razorpay.open();
            setLoading(false);

        } catch (error) {
            console.error('Payment initiation error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });

            alert('Payment initiation failed: ' + (error.message || 'Unknown error occurred'));
            setLoading(false);
            setPaymentStatus('failed');
        }
    };

    return (
        <div className="payment-gateway-container">
            <div className="payment-gateway-card">
                <h1  >Razorpay Payment Gateway</h1>
                <p className="subtitle">Secure payment processing</p>

                <div className="payment-form">
                    <div className="form-group">
                        <label htmlFor="amount">Enter Amount (₹)</label>
                        <input
                            id="amount"
                            type="number"
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            placeholder="Enter amount in INR"
                            disabled={loading}
                        />
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="pay-button"
                    >
                        {loading ? 'Processing...' : `Pay ₹${amount}`}
                    </button>

                    {paymentStatus && (
                        <div className={`payment-status ${paymentStatus}`}>
                            {paymentStatus === 'success' && '✅ Payment Successful!'}
                            {paymentStatus === 'failed' && '❌ Payment Failed!'}
                            {paymentStatus === 'cancelled' && '⚠️ Payment Cancelled'}
                        </div>
                    )}
                </div>

                <div className="payment-info">
                    <h3>Test Card Details (for testing):</h3>
                    <ul>
                        <li><strong>Card Number:</strong> 4111 1111 1111 1111</li>
                        <li><strong>Expiry:</strong> Any future date</li>
                        <li><strong>CVV:</strong> Any 3 digits</li>
                        <li><strong>Name:</strong> Any name</li>
                    </ul>
                    <p className="note">⚠️ Remember to update Razorpay Key ID in the code</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentGateway;