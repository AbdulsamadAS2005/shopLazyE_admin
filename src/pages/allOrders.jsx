import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBox,           // Package
    faShoppingCart,  // ShoppingCart
    faShieldAlt,     // Shield
    faSignOutAlt,    // LogOut
    faClock,         // Clock
    faListAlt,       // List for orders
    faCheckCircle,   // CheckCircle for completed
    faHourglassHalf, // HourglassHalf for pending
    faUser,          // User
    faEnvelope,      // Envelope
    faPhone,         // Phone
    faMapMarkerAlt,  // MapMarkerAlt
    faDollarSign,    // DollarSign
    faCreditCard,    // CreditCard
    faCheck,         // Check
    faEye,           // Eye
    faCalendarAlt,   // CalendarAlt
    faTruck,         // Truck for shipping
    faExclamationTriangle, // ExclamationTriangle
    faTimes,         // Times
    faCheckDouble,   // CheckDouble
    faShoppingBag,   // ShoppingBag
    faReceipt,       // Receipt
    faHistory,       // History
    faSyncAlt        // SyncAlt for update
} from '@fortawesome/free-solid-svg-icons';

const apiURL = import.meta.env.VITE_Backend;

const AllOrders = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [timeLeft, setTimeLeft] = useState(7200);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');

    // Orders state
    const [orders, setOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);

    // Status update modal state
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [orderToUpdate, setOrderToUpdate] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Toast notifications
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        checkAuth();
        fetchOrders();
    }, []);

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

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // Use the endpoint that returns orders with product details
            const response = await fetch(`${apiURL}/admin/orders`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();

                // The server should now return orders with product details populated
                setOrders(data);
                console.log(orders);
                
                const pending = data.filter(order => order.Status === 'pending');
                const completed = data.filter(order => order.Status === 'completed');

                setPendingOrders(pending);
                setCompletedOrders(completed);
            } else {
                throw new Error('Failed to fetch orders');
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            addToast('Error fetching orders', 'error');
            // Don't use mock data - show empty state instead
            setOrders([]);
            setPendingOrders([]);
            setCompletedOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Mock data for demonstration
    const useMockData = () => {
        const mockOrders = [
            {
                _id: '1',
                orderNumber: 'ORD-2024-001',
                Status: 'pending',
                createdAt: new Date('2024-01-15T10:30:00'),
                Name: 'John Doe',
                Email: 'john@example.com',
                PhoneNumber: '+1234567890',
                Address: '123 Main St, New York, NY 10001',
                PaymentMethod: 'Credit Card',
                Totalprice: 149.99,
                products: [
                    {
                        Name: 'Premium Summer T-Shirt',
                        ImageUrl: 'https://via.placeholder.com/150',
                        Price: 49.99,
                        quantity: 2
                    },
                    {
                        Name: 'Casual Polo Shirt',
                        ImageUrl: 'https://via.placeholder.com/150',
                        Price: 50.00,
                        quantity: 1
                    }
                ]
            },
            {
                _id: '2',
                orderNumber: 'ORD-2024-002',
                Status: 'completed',
                createdAt: new Date('2024-01-14T15:45:00'),
                Name: 'Jane Smith',
                Email: 'jane@example.com',
                PhoneNumber: '+9876543210',
                Address: '456 Oak Ave, Los Angeles, CA 90001',
                PaymentMethod: 'PayPal',
                Totalprice: 299.99,
                products: [
                    {
                        Name: 'Winter Jacket',
                        ImageUrl: 'https://via.placeholder.com/150',
                        Price: 199.99,
                        quantity: 1
                    },
                    {
                        Name: 'Woolen Scarf',
                        ImageUrl: 'https://via.placeholder.com/150',
                        Price: 50.00,
                        quantity: 2
                    }
                ]
            },
            {
                _id: '3',
                orderNumber: 'ORD-2024-003',
                Status: 'pending',
                createdAt: new Date('2024-01-16T09:15:00'),
                Name: 'Robert Johnson',
                Email: 'robert@example.com',
                PhoneNumber: '+1122334455',
                Address: '789 Pine Rd, Chicago, IL 60007',
                PaymentMethod: 'Cash on Delivery',
                Totalprice: 89.99,
                products: [
                    {
                        Name: 'Plain White T-Shirt',
                        ImageUrl: 'https://via.placeholder.com/150',
                        Price: 29.99,
                        quantity: 3
                    }
                ]
            }
        ];

        setOrders(mockOrders);
        const pending = mockOrders.filter(order => order.Status === 'pending');
        const completed = mockOrders.filter(order => order.Status === 'completed');

        setPendingOrders(pending);
        setCompletedOrders(completed);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCompleteOrder = (order) => {
        setOrderToUpdate(order);
        setShowStatusModal(true);
    };

    const handleConfirmStatusUpdate = async () => {
        if (!orderToUpdate) return;

        setUpdatingStatus(true);
        try {
            // This endpoint should be created in your backend
            const response = await fetch(`${apiURL}/admin/update-order-status/${orderToUpdate._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'completed'
                })
            });

            if (response.ok) {
                // Update local state
                const updatedOrders = orders.map(order =>
                    order._id === orderToUpdate._id
                        ? { ...order, Status: 'completed' }
                        : order
                );

                setOrders(updatedOrders);
                const pending = updatedOrders.filter(order => order.Status === 'pending');
                const completed = updatedOrders.filter(order => order.Status === 'completed');

                setPendingOrders(pending);
                setCompletedOrders(completed);

                addToast('Order marked as completed successfully!');
            } else {
                addToast('Failed to update order status', 'error');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            addToast('Error updating order status', 'error');
        } finally {
            setUpdatingStatus(false);
            setShowStatusModal(false);
            setOrderToUpdate(null);
        }
    };

    const handleCancelStatusUpdate = () => {
        setShowStatusModal(false);
        setOrderToUpdate(null);
        setUpdatingStatus(false);
    };

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        const newToast = {
            id,
            message,
            type
        };

        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            removeToast(id);
        }, 4000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const renderOrderCard = (order) => (
        <div key={order._id} className={`order-card ${order.Status}`}>
            <div className="order-card-header">
                <div className="order-id">
                    <FontAwesomeIcon icon={faReceipt} />
                    <span>{order.orderNumber || `ORD-${order._id}`}</span>
                    <span className={`order-id-badge ${order.Status}`}>
                        {order.Status === 'pending' ? 'Pending' : 'Completed'}
                    </span>
                </div>
                <div className="order-date">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{formatDate(order.createdAt)}</span>
                </div>
            </div>

            <div className="order-customer-info">
                <div className="customer-name">
                    <FontAwesomeIcon icon={faUser} />
                    <span>{order.Name}</span>
                </div>
                <div className="customer-email">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{order.Email}</span>
                </div>
                <div className="customer-phone">
                    <FontAwesomeIcon icon={faPhone} />
                    <span>{order.PhoneNumber}</span>
                </div>
                <div className="customer-address">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{order.Address}</span>
                </div>
            </div>

            <div className="order-products">
                <h4 className="order-products-title">Order Items</h4>
                {order.products && order.products.map((product, index) => (
                    <div key={index} className="order-product-item">
                        <div className="order-product-image">
                            <img
                                src={product.ImageUrl || 'https://via.placeholder.com/50'}
                                alt={product.Name}
                                className="order-product-img"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/50';
                                }}
                            />
                        </div>
                        <div className="order-product-details">
                            <div className="order-product-name">{product.Name}</div>
                            <div className="order-product-quantity">
                                Quantity: {product.quantity || 1}
                            </div>
                        </div>
                        <div className="order-product-price">
                            Rs. {product.Price}
                        </div>
                    </div>
                ))}
            </div>

            <div className="order-footer">
                <div className="order-total">
                    <FontAwesomeIcon icon={faDollarSign} />
                    <span>Total: Rs. {order.Totalprice}</span>
                </div>
                <div className="order-payment-method">
                    <FontAwesomeIcon icon={faCreditCard} />
                    <span>{order.PaymentMethod}</span>
                </div>
                <div className="order-actions">

                    {order.Status === 'pending' && (
                        <button
                            className="complete-order-btn"
                            onClick={() => handleCompleteOrder(order)}
                        >
                            <FontAwesomeIcon icon={faCheckCircle} />
                            <span>Mark Complete</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderOrdersSection = (ordersList, title, icon, emptyMessage) => (
        <div className="orders-section">
            <div className="orders-section-header">
                <h2 className="orders-section-title">
                    {icon}
                    {title}
                    <span className="orders-section-count">{ordersList.length}</span>
                </h2>
            </div>

            {loading ? (
                <div className="orders-loading">
                    <div className="spinner"></div>
                    <p className="orders-loading-text">Loading orders...</p>
                </div>
            ) : ordersList.length > 0 ? (
                <div className="orders-list">
                    {ordersList.map(renderOrderCard)}
                </div>
            ) : (
                <div className="orders-empty-state">
                    {icon}
                    <h3 className="orders-empty-title">No {title.toLowerCase()}</h3>
                    <p className="orders-empty-subtitle">{emptyMessage}</p>
                </div>
            )}
        </div>
    );

    const renderStatusUpdateModal = () => {
        if (!showStatusModal || !orderToUpdate) return null;

        return (
            <div className="status-update-modal-overlay">
                <div className="status-update-modal">
                    <div className="status-update-modal-header">
                        <FontAwesomeIcon icon={faCheckDouble} className="status-update-modal-icon" />
                        <h3>Complete Order Confirmation</h3>
                        <button
                            className="status-update-modal-close-btn"
                            onClick={handleCancelStatusUpdate}
                            disabled={updatingStatus}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className="status-update-modal-body">
                        <p>Are you sure you want to mark this order as completed?</p>
                        <div className="order-confirm-info">
                            <strong>Order: {orderToUpdate.orderNumber || `ORD-${orderToUpdate._id}`}</strong>
                            <div className="customer-info-list">
                                <div className="customer-info-item">
                                    <FontAwesomeIcon icon={faUser} />
                                    <span>Customer: {orderToUpdate.Name}</span>
                                </div>
                                <div className="customer-info-item">
                                    <FontAwesomeIcon icon={faDollarSign} />
                                    <span>Amount: Rs. {orderToUpdate.Totalprice}</span>
                                </div>
                                <div className="customer-info-item">
                                    <FontAwesomeIcon icon={faCreditCard} />
                                    <span>Payment: {orderToUpdate.PaymentMethod}</span>
                                </div>
                            </div>
                        </div>
                        <p style={{ marginTop: '20px', fontSize: '0.95rem', color: '#64748B' }}>
                            This action will move the order from pending to completed status.
                        </p>
                    </div>

                    <div className="status-update-modal-footer">
                        <button
                            className="status-update-cancel-btn"
                            onClick={handleCancelStatusUpdate}
                            disabled={updatingStatus}
                        >
                            Cancel
                        </button>
                        <button
                            className="status-update-confirm-btn"
                            onClick={handleConfirmStatusUpdate}
                            disabled={updatingStatus}
                        >
                            {updatingStatus ? (
                                <>
                                    <div className="status-update-spinner"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCheck} />
                                    Confirm Complete
                                </>
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
                        <FontAwesomeIcon icon={
                            toast.type === 'success' ? faCheckCircle :
                                toast.type === 'error' ? faExclamationTriangle : faInfoCircle
                        } />
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
                        <FontAwesomeIcon icon={faTimes} />
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

            {/* Status Update Modal */}
            {renderStatusUpdateModal()}

            {/* Header */}
            <div className="container">
                <div className="header">
                    <div className="header-left">
                        <h1 className="dashboard-title">
                            <FontAwesomeIcon icon={faShoppingCart} className="shield-icon" />
                            Orders Management
                        </h1>
                        <p className="welcome-text">Manage customer orders and track order status</p>
                    </div>

                    <div className="header-right">
                        <div className="session-timer">
                            <FontAwesomeIcon icon={faClock} className="clock-icon" />
                            <span className="timer-text">Session: {formatTime(timeLeft)}</span>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="logout-btn"
                            style={{ background: '#EFF6FF', color: '#2563EB' }}
                        >
                            <FontAwesomeIcon icon={faShieldAlt} className="logout-icon" />
                            <span>Dashboard</span>
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

                {/* Orders Tabs Navigation */}
                <div className="orders-tabs-navigation">
                    <button
                        className={`order-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <FontAwesomeIcon icon={faHourglassHalf} />
                        <span>Pending Orders</span>
                        <span className="order-tab-badge">{pendingOrders.length}</span>
                    </button>
                    <button
                        className={`order-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Completed Orders</span>
                        <span className="order-tab-badge">{completedOrders.length}</span>
                    </button>
                    <button
                        className={`order-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        <FontAwesomeIcon icon={faListAlt} />
                        <span>All Orders</span>
                        <span className="order-tab-badge">{orders.length}</span>
                    </button>
                </div>

                {/* Orders Content */}
                <div className="orders-content">
                    {activeTab === 'pending' && renderOrdersSection(
                        pendingOrders,
                        'Pending Orders',
                        <FontAwesomeIcon icon={faHourglassHalf} className="orders-section-icon" />,
                        'No pending orders at the moment. All orders are completed!'
                    )}

                    {activeTab === 'completed' && renderOrdersSection(
                        completedOrders,
                        'Completed Orders',
                        <FontAwesomeIcon icon={faCheckCircle} className="orders-section-icon" />,
                        'No completed orders yet. Orders will appear here once marked as complete.'
                    )}

                    {activeTab === 'all' && renderOrdersSection(
                        orders,
                        'All Orders',
                        <FontAwesomeIcon icon={faListAlt} className="orders-section-icon" />,
                        'No orders found in the system.'
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllOrders;