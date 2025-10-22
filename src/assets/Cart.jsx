import React from 'react';

const CartItem = ({ item }) => (
    <div className="cart-item">
        <img src={item.imageUrl} alt={item.productName} className="cart-item-image" />
        <div className="cart-item-details">
            <h3>{item.productName}</h3>
            <p>Price: {item.price}</p>
            <p>Quantity: {item.quantity}</p>
        </div>
    </div>
);

const Cart = () => {
    const cartItems = [
        // ...existing cart items
    ];

    return (
        <div className="cart-container">
            {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
            ))}
        </div>
    );
};

export default Cart;