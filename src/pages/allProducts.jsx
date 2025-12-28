import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBox,           // Package
    faPlus,          // Plus
    faStar,          // Star
    faChartLine,     // TrendingUp
    faClock,         // Clock
    faEdit,          // Edit
    faTrashAlt,      // Trash2
    faShieldAlt,     // Shield
    faSignOutAlt,    // LogOut
    faTimes,         // X
    faCheck,         // Check
    faDollarSign,    // DollarSign
    faTag,           // Tag
    faLayerGroup,    // Layers
    faImage,         // Image
    faBoxOpen,       // For products section
    faFire,          // For best sellers
    faHistory,       // For recent activity
    faShoppingCart,  // For orders
    faExclamationTriangle, // For warning icon
    faCheckCircle,   // For success icon
    faExclamationCircle, // For error icon
    faTimesCircle    // For close toast
} from '@fortawesome/free-solid-svg-icons';
const apiURL = import.meta.env.VITE_Backend;

const AllProducts = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [timeLeft, setTimeLeft] = useState(7200);
    const [products, setProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [productToDeleteName, setProductToDeleteName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast notification state
    const [toasts, setToasts] = useState([]);

    // New product form state
    const [newProduct, setNewProduct] = useState({
        Name: '',
        Category: '',
        SubCategory: '',
        Price: '',
        DiscountedPrice: '',
        Image: null,
        BestSeller: false
    });

    // Loading state for image upload
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        checkAuth();
        fetchProducts();
    }, []);

    // Add toast function
    const addToast = (message, type = 'success') => {
        const id = Date.now();
        const newToast = {
            id,
            message,
            type
        };

        setToasts(prev => [...prev, newToast]);

        // Auto remove toast after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    };

    // Remove toast function
    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const handleToggleAddForm = () => {
        if (showAddForm) {
            handleCancelForm();
        } else {
            handleAddNewProduct();
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        localStorage.removeItem('shopLazy-admin_auth');
                        setIsAuthenticated(false);
                        navigate('/');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isAuthenticated, navigate]);

    const checkAuth = () => {
        const authData = localStorage.getItem('shopLazy-admin_auth');
        if (authData) {
            const { token, expiry } = JSON.parse(authData);
            const now = Date.now();

            if (token === 'abdulsamad@1212' && now < expiry) {
                setIsAuthenticated(true);
                const remaining = Math.floor((expiry - now) / 1000);
                setTimeLeft(remaining);
                return true;
            } else {
                localStorage.removeItem('shopLazy-admin_auth');
                navigate('/');
            }
        } else {
            navigate('/');
        }
        return false;
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let response = await fetch(`${apiURL}/admin/products`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            let data = await response.json();


            if (response.status === 201) {
                setProducts(data);

                // Filter best sellers
                const bestSellerProducts = data.filter(product => product.BestSeller === true);
                setBestSellers(bestSellerProducts);

                // Filter new arrivals (products created within last 7 days)
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const newArrivalProducts = data.filter(product => {
                    const createdAt = new Date(product.createdAt);
                    return createdAt > sevenDaysAgo;
                });
                setNewArrivals(newArrivalProducts);
            }
        } catch (error) {
            console.log("error", error);
            addToast('Error fetching products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('shopLazy-admin_auth');
        setIsAuthenticated(false);
        navigate('/');
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product._id);
        setNewProduct({
            Name: product.Name || '',
            Category: product.Category || '',
            SubCategory: product.SubCategory || '',
            Price: product.Price || '',
            DiscountedPrice: product.DiscountedPrice || '',
            ImageUrl: product.ImageUrl || '',
            BestSeller: product.BestSeller || false
        });
        setShowAddForm(true);
    };

    const handleDeleteClick = (productId, productName) => {
        setProductToDelete(productId);
        setProductToDeleteName(productName);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`${apiURL}/admin/delete-products/${productToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove product from all lists
                setProducts(products.filter(p => p._id !== productToDelete));
                setBestSellers(bestSellers.filter(p => p._id !== productToDelete));
                setNewArrivals(newArrivals.filter(p => p._id !== productToDelete));

                // Show success toast
                addToast('Product deleted successfully!');
            } else {
                addToast('Failed to delete product', 'error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            addToast('Error deleting product', 'error');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setProductToDelete(null);
            setProductToDeleteName('');
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
        setProductToDeleteName('');
        setIsDeleting(false);
    };

    const handleAddNewProduct = () => {
        setShowAddForm(true);
        setEditingProduct(null);
        setNewProduct({
            Name: '',
            Category: '',
            SubCategory: '',
            Price: '',
            DiscountedPrice: '',
            Image: null,
            BestSeller: false
        });
    };

    const handleCancelForm = () => {
        setShowAddForm(false);
        setEditingProduct(null);
        setNewProduct({
            Name: '',
            Category: '',
            SubCategory: '',
            Price: '',
            DiscountedPrice: '',
            Image: null,
            BestSeller: false
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        setNewProduct({
            ...newProduct,
            [name]:
                type === 'checkbox'
                    ? checked
                    : type === 'file'
                        ? files[0]
                        : value
        });
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();

        if (!newProduct.Name || !newProduct.Price) {
            addToast('Product name and price are required!', 'error');
            return;
        }

        if (!editingProduct && !newProduct.Image) {
            addToast('Product image is required for new products!', 'error');
            return;
        }

        try {
            setIsUploading(true);

            // Create FormData object
            const formData = new FormData();
            formData.append('Name', newProduct.Name);
            formData.append('Category', newProduct.Category);
            formData.append('SubCategory', newProduct.SubCategory);
            formData.append('Price', newProduct.Price);
            formData.append('DiscountedPrice', newProduct.DiscountedPrice || newProduct.Price);
            formData.append('BestSeller', newProduct.BestSeller);

            // Add image if provided
            if (newProduct.Image) {
                formData.append('Image', newProduct.Image);
            }

            const url = editingProduct
                ? `${apiURL}/admin/update-product/${editingProduct}`
                : `${apiURL}/admin/add-product`;

            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formData
                // NO Content-Type header - let browser set it automatically for FormData
            });

            const data = await response.json();

            if (response.ok) {
                fetchProducts();
                handleCancelForm();
                
                // Show toast message
                addToast(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
            } else {
                throw new Error(data.message || 'Failed to save product');
            }
        } catch (err) {
            console.error('Error saving product:', err);
            addToast(err.message || 'Error saving product', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const renderProductRow = (product) => (
        <div key={product._id} className="product-row">
            <div className="product-image">
                <img
                    src={product.ImageUrl || 'https://via.placeholder.com/80'}
                    alt={product.Name}
                    className="product-img"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80';
                    }}
                />
            </div>
            <div className="product-info">
                <h3 className="product-name">{product.Name}</h3>
                <p className="product-category">{product.Category} {product.SubCategory && `/ ${product.SubCategory}`}</p>
            </div>
            <div className="product-pricing">
                {product.DiscountedPrice ? (
                    <>
                        <span className="original-price">Rs. {product.Price}</span>
                        <span className="discounted-price">Rs. {product.DiscountedPrice}</span>
                    </>
                ) : (
                    <span className="regular-price">Rs. {product.Price}</span>
                )}
            </div>
            <div className="product-status">
                {product.BestSeller && (
                    <span className="best-seller-badge">
                        <FontAwesomeIcon icon={faStar} style={{ fontSize: '14px' }} />
                        Best Seller
                    </span>
                )}
            </div>
            <div className="product-actions">
                <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteClick(product._id, product.Name)}
                    title="Delete Product"
                >
                    <FontAwesomeIcon icon={faTrashAlt} style={{ fontSize: '16px' }} />
                </button>
            </div>
        </div>
    );

    const renderSection = (title, icon, productsList, emptyMessage) => (
        <div className="products-section">
            <div className="section-header">
                {icon}
                <h2 className="section-title">{title} ({productsList.length})</h2>
            </div>
            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading {title.toLowerCase()}...</p>
                </div>
            ) : productsList.length > 0 ? (
                <div className="products-list">
                    {productsList.map(renderProductRow)}
                </div>
            ) : (
                <div className="empty-state">
                    <p>{emptyMessage}</p>
                </div>
            )}
        </div>
    );

    const renderAddProductForm = () => (
        <div className={`add-product-form ${showAddForm ? 'show' : ''}`}>
            <div className="form-header">
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button className="close-form-btn" onClick={handleCancelForm}>
                    <FontAwesomeIcon icon={faTimes} style={{ fontSize: '20px', color: '#333' }} />
                </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="product-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">
                            <FontAwesomeIcon icon={faBox} style={{ fontSize: '16px' }} />
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="Name"
                            value={newProduct.Name}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Enter product name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: '16px' }} />
                            Category
                        </label>
                        <select
                            name="Category"
                            value={newProduct.Category}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="summer">Summer</option>
                            <option value="winter">Winter</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: '16px' }} />
                            Sub Category
                        </label>
                        <select
                            name="SubCategory"
                            value={newProduct.SubCategory}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        >
                            <option value="">Select Sub Category</option>
                            <option value="polo">Polo</option>
                            <option value="plain">Plain</option>
                            <option value="oversize">Oversize</option>
                        </select>

                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FontAwesomeIcon icon={faDollarSign} style={{ fontSize: '16px' }} />
                            Price *
                        </label>
                        <input
                            type="number"
                            name="Price"
                            value={newProduct.Price}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FontAwesomeIcon icon={faTag} style={{ fontSize: '16px' }} />
                            Discounted Price
                        </label>
                        <input
                            type="number"
                            name="DiscountedPrice"
                            value={newProduct.DiscountedPrice}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FontAwesomeIcon icon={faImage} style={{ fontSize: '16px' }} />
                            Product Image {!editingProduct && '*'}
                        </label>
                        <input
                            type="file"
                            name="Image"
                            accept="image/*"
                            onChange={handleInputChange}
                            className="form-input"
                            required={!editingProduct}
                        />
                        <small className="form-hint">
                            Supported formats: JPG, PNG, WebP. Max size: 5MB
                        </small>
                        {editingProduct && newProduct.ImageUrl && (
                            <div className="current-image">
                                <p>Current Image:</p>
                                <img 
                                    src={newProduct.ImageUrl} 
                                    alt="Current" 
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', marginTop: '5px' }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="BestSeller"
                                checked={newProduct.BestSeller}
                                onChange={handleInputChange}
                                className="checkbox-input"
                            />
                            <span className="checkbox-custom"></span>
                            <FontAwesomeIcon icon={faStar} style={{ fontSize: '16px' }} />
                            Mark as Best Seller
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="cancel-btn" 
                        onClick={handleCancelForm}
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <div className="delete-spinner" style={{ marginRight: '8px' }}></div>
                                {editingProduct ? 'Updating...' : 'Adding...'}
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faCheck} style={{ fontSize: '18px' }} />
                                {editingProduct ? 'Update Product' : 'Add Product'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderDeleteConfirmationModal = () => {
        if (!showDeleteModal) return null;

        return (
            <div className="delete-modal-overlay">
                <div className="delete-modal">
                    <div className="delete-modal-header">
                        <FontAwesomeIcon icon={faTrashAlt} className="delete-modal-icon" />
                        <h3>Confirm Deletion</h3>
                        <button
                            className="delete-modal-close-btn"
                            onClick={handleCancelDelete}
                            disabled={isDeleting}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className="delete-modal-body">
                        <p>Are you sure you want to delete this product?</p>
                        <div className="delete-product-info">
                            <strong>{productToDeleteName}</strong>
                            <p className="delete-warning-text">
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                This action cannot be undone. All product data will be permanently removed.
                            </p>
                        </div>
                    </div>

                    <div className="delete-modal-footer">
                        <button
                            className="delete-cancel-btn"
                            onClick={handleCancelDelete}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            className="delete-confirm-btn"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <div className="delete-spinner"></div>
                                    Deleting...
                                </>
                            ) : (
                                'Delete Product'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderToastNotifications = () => (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast ${toast.type}`}
                    onClick={() => removeToast(toast.id)}
                >
                    <div className="toast-icon">
                        {toast.type === 'success' ? (
                            <FontAwesomeIcon icon={faCheckCircle} />
                        ) : (
                            <FontAwesomeIcon icon={faExclamationCircle} />
                        )}
                    </div>
                    <div className="toast-content">
                        <p className="toast-message">{toast.message}</p>
                    </div>
                    <button
                        className="toast-close-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeToast(toast.id);
                        }}
                    >
                        <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                    <div className="toast-progress"></div>
                </div>
            ))}
        </div>
    );

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="admin-panel">
            {/* Toast Notifications */}
            {renderToastNotifications()}

            {/* Delete Confirmation Modal */}
            {renderDeleteConfirmationModal()}

            {/* Header */}
            <div className="container">
                <div className="header">
                    <div className="header-left">
                        <h1 className="dashboard-title">
                            <FontAwesomeIcon icon={faBox} className="shield-icon" />
                            Products Management
                        </h1>
                        <p className="welcome-text">Manage all your products from here</p>
                    </div>

                    <div className="header-right">
                        <div className="session-timer">
                            <FontAwesomeIcon icon={faClock} className="clock-icon" />
                            <span className="timer-text">Session: {formatTime(timeLeft)}</span>
                        </div>
                        <button
                            className={`add-product-btn ${showAddForm ? 'active' : ''}`}
                            onClick={handleToggleAddForm}
                        >
                            <FontAwesomeIcon icon={faPlus} className="plus-icon" />
                            <span>{showAddForm ? 'Cancel Add' : 'Add New Product'}</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="logout-btn"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Add Product Form (shown when clicking Add button) */}
                {showAddForm && renderAddProductForm()}

                {/* Tabs Navigation */}
                <div className="tabs-navigation">
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        <FontAwesomeIcon icon={faBox} style={{ fontSize: '18px' }} />
                        All Products ({products.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'best' ? 'active' : ''}`}
                        onClick={() => setActiveTab('best')}
                    >
                        <FontAwesomeIcon icon={faChartLine} style={{ fontSize: '18px' }} />
                        Best Sellers ({bestSellers.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
                        onClick={() => setActiveTab('new')}
                    >
                        <FontAwesomeIcon icon={faClock} style={{ fontSize: '18px' }} />
                        New Arrivals ({newArrivals.length})
                    </button>
                </div>

                {/* Products Content */}
                <div className="products-content">
                    {activeTab === 'all' && renderSection(
                        'All Products',
                        <FontAwesomeIcon icon={faBox} className="section-icon" />,
                        products,
                        'No products found. Click "Add New Product" to get started!'
                    )}

                    {activeTab === 'best' && renderSection(
                        'Best Sellers',
                        <FontAwesomeIcon icon={faStar} className="section-icon" />,
                        bestSellers,
                        'No best sellers found. Mark products as best sellers to see them here.'
                    )}

                    {activeTab === 'new' && renderSection(
                        'New Arrivals',
                        <FontAwesomeIcon icon={faClock} className="section-icon" />,
                        newArrivals,
                        'No new arrivals in the last 7 days.'
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllProducts;