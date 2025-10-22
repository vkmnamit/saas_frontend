import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BulkUpload.css';

const BulkProductUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorDetails, setErrorDetails] = useState(null);
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
            if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
                setError('Please select a valid Excel file (.xlsx or .xls)');
                setFile(null);
                return;
            }

            // Validate file size (5MB limit)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setError('');
            setSuccess('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select an Excel file first');
            return;
        }

        setLoading(true);
        setError('');
        setErrorDetails(null);
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Uploading file:', file.name);

            const res = await fetch('http://localhost:5002/api/products/bulk-upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await res.json();
            console.log('Upload response:', data);

            if (!res.ok) {
                // Set detailed error information
                if (data.invalidRows && data.invalidRows.length > 0) {
                    setErrorDetails(data.invalidRows);
                }
                throw new Error(data.message || 'Upload failed');
            }

            setSuccess(`✅ Successfully uploaded ${data.count} products!`);
            setFile(null);
            setErrorDetails(null);

            // Reset file input
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.value = '';

            // Navigate to product order page after 2 seconds
            setTimeout(() => {
                navigate('/product-order');
            }, 2000);

        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload products. Please check your file and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            const event = { target: { files: [droppedFile] } };
            handleFileChange(event);
        }
    };

    return (
        <div className="bulk-upload-container">
            <div className="bulk-upload-card">
                <div className="upload-header">
                    <h2>📦 Bulk Product Upload</h2>
                    <p className="subtitle">Upload an Excel file to add multiple products at once</p>
                </div>

                <div className="upload-section">
                    <div
                        className={`file-drop-zone ${file ? 'has-file' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            id="file-input"
                            disabled={loading}
                        />
                        <label htmlFor="file-input" className="file-label">
                            {file ? (
                                <>
                                    <span className="file-icon">📄</span>
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                                </>
                            ) : (
                                <>
                                    <span className="upload-icon">☁️</span>
                                    <span className="upload-text">Click to browse or drag & drop Excel file</span>
                                    <span className="upload-hint">Supported: .xlsx, .xls (Max 5MB)</span>
                                </>
                            )}
                        </label>
                    </div>

                    {error && (
                        <div className="message error-message">
                            <div className="error-header">
                                <span>❌</span> {error}
                            </div>
                            {errorDetails && errorDetails.length > 0 && (
                                <div className="error-details">
                                    <p><strong>Problem rows (first 10 shown):</strong></p>
                                    <ul className="error-list">
                                        {errorDetails.map((detail, index) => (
                                            <li key={index}>
                                                <strong>Row {detail.row}:</strong> {detail.errors.join(', ')}
                                                <br />
                                                <span className="detail-text">
                                                    Product: "{detail.productName}", Price: {detail.price || 'missing'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="error-help">
                                        💡 <strong>How to fix:</strong> Open your Excel file and check these rows.
                                        Ensure every product has a name and a price greater than 0.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {success && (
                        <div className="message success-message">
                            <span>✅</span> {success}
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={loading || !file}
                        className="upload-btn"
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <span>⬆️</span>
                                Upload Products
                            </>
                        )}
                    </button>
                </div>

                <div className="template-section">
                    <h3>📋 Excel File Format</h3>
                    <p>Your Excel file must include these columns (column names must match exactly):</p>

                    <div className="template-table-wrapper">
                        <table className="template-table">
                            <thead>
                                <tr>
                                    <th>productName *</th>
                                    <th>description</th>
                                    <th>price *</th>
                                    <th>stock</th>
                                    <th>category</th>
                                    <th>imageUrl</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Wireless Headphones</td>
                                    <td>Bluetooth headphones</td>
                                    <td>2999</td>
                                    <td>50</td>
                                    <td>Electronics</td>
                                    <td>https://example.com/img.jpg</td>
                                </tr>
                                <tr>
                                    <td>Smart Watch</td>
                                    <td>Fitness tracker</td>
                                    <td>5999</td>
                                    <td>30</td>
                                    <td>Electronics</td>
                                    <td>https://example.com/watch.jpg</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="template-notes">
                        <p><strong>Note:</strong></p>
                        <ul>
                            <li>Fields marked with * are required</li>
                            <li>Price must be a positive number</li>
                            <li>Stock defaults to 0 if not provided</li>
                            <li>Category defaults to "General" if not provided</li>
                            <li>First row must be column headers</li>
                        </ul>
                    </div>

                    <div className="action-buttons">
                        <button
                            onClick={() => navigate('/product-order')}
                            className="btn-secondary"
                        >
                            View Products
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-secondary"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkProductUpload;
