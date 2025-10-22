import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Product.css";

export default function AddProduct() {
    const [form, setForm] = useState({
        productName: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        imageUrl: "",
        userId: "",
    });
    const [loadingUser, setLoadingUser] = useState(true);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('http://localhost:5002/api/users/profile', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    console.error(`Failed to fetch profile: ${res.statusText}`);
                    return;
                }
                const data = await res.json();
                // profile returns _id
                setForm(f => ({ ...f, userId: data._id || data.user?._id || '' }));
            } catch (err) {
                console.error('Failed to load profile for product submission', err);
            } finally {
                setLoadingUser(false);
            }
        })();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { productName, description, price, category, stock, imageUrl, userId } = form;

        // Validation
        if (!productName || !description || !price || !category || !stock || !userId) {
            alert('All fields are required. Please fill out the form completely.');
            return;
        }
        if (price <= 0 || stock <= 0) {
            alert('Price and stock must be positive numbers.');
            return;
        }

        const payload = {
            productName,
            description,
            price: Number(price),
            category,
            stock: Number(stock),
            imageUrl,
            userId
        };

        try {
            const response = await fetch('http://localhost:5002/api/users/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            let data;
            try {
                data = await response.json();
            } catch (err) {
                console.error('Failed to parse JSON response:', err);
                alert('Unexpected server response. Please try again later.');
                return;
            }
            if (!response.ok) {
                console.error(`Failed to add product: ${response.statusText}`);
                alert(`Failed to add product: ${data.message || 'Unknown error'}`);
                return;
            }
            // navigate to product-order list page
            navigate('/product-order');
            // keep userId so subsequent submissions don't require reload/signin
            setForm({
                productName: "",
                description: "",
                price: "",
                category: "",
                stock: "",
                imageUrl: "",
                userId: form.userId
            });
        } catch (err) {
            console.error('Network error adding product', err);
            alert('Network error adding product. Check the server and try again.');
        }
    };

    return (
        <div className="add-product-container">
            <h2>Add Product</h2>
            <form onSubmit={handleSubmit}>
                <input name="productName" placeholder="Product Name" onChange={handleChange} value={form.productName} required /><br />
                <textarea name="description" placeholder="Description" onChange={handleChange} value={form.description} /><br />
                <input name="price" placeholder="Price" type="number" onChange={handleChange} value={form.price} /><br />
                <input name="category" placeholder="Category" onChange={handleChange} value={form.category} /><br />
                <input name="imageUrl" type="text" placeholder="Image URL" onChange={handleChange} value={form.imageUrl} /><br />
                <input name="stock" placeholder="Stock" type="number" onChange={handleChange} value={form.stock} /><br />
                <button type="submit">Add Product</button>
            </form>
        </div>
    );

}

