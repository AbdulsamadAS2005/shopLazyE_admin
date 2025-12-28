import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Shield, Clock, LogOut } from 'lucide-react';
const apiURL = import.meta.env.VITE_Backend;

const Home = () => {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error,setError]=useState(false)
  const [timeLeft, setTimeLeft] = useState(7200);
  const [data,setData]=useState()

  useEffect(() => {
    checkAuth();
    handleData();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            localStorage.removeItem('shopLazy-admin_auth');
            setIsAuthenticated(false);
            setShowPasswordModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  const handleData=async()=>{
    try {
      let response=await fetch(`${apiURL}/adminHomePage`,{
        method:"GET",
        headers:{
          "Content-Type":"application/json"
        }
      })
      let data=await response.json();
      if(response.status==200){
        setData(data=data);
      
      }
    } catch (error) {
      console.log("error",error);
      
    }
  }

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
      }
    }
    setShowPasswordModal(true);
    return false;
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'abdulsamad@1212') {
      const expiry = Date.now() + (2 * 60 * 60 * 1000);
      const authData = {
        token: password,
        expiry: expiry
      };
      localStorage.setItem('shopLazy-admin_auth', JSON.stringify(authData));
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setTimeLeft(7200);
    } else {
      setError(true);
      setTimeout(() => {
        setError(false)
      }, 2000);
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shopLazy-admin_auth');
    setIsAuthenticated(false);
    setPassword("");
    setShowPasswordModal(true);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated && showPasswordModal) {
    return <PasswordModal 
      password={password}
      setPassword={setPassword}
      onSubmit={handlePasswordSubmit}
      error={error}
    />;
  }

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="container">
        <div className="header">
          <div className="header-left">
            <h1 className="dashboard-title">
              <Shield className="shield-icon" />
              Admin Dashboard
            </h1>
            <p className="welcome-text">Welcome back, Administrator</p>
          </div>
          
          <div className="header-right">
            <div className="session-timer">
              <Clock className="clock-icon" />
              <span className="timer-text">Session: {formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              <LogOut className="logout-icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div>
                <p className="stat-label">Total Products</p>
                {
                  data?
                  <p className="stat-value">{data.totalProducts}</p>
                  :
                  <div className="spinner"></div>
                }
              </div>
              <div className="stat-icon-container">
                <Package className="stat-icon" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div>
                <p className="stat-label">Total Orders</p>
                {
                  data?
                  <p className="stat-value">{data.pendingOrders}</p>
                  :
                  <div className="spinner"></div>
                }
              </div>
              <div className="stat-icon-container">
                <ShoppingCart className="stat-icon" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div>
                <p className="stat-label">New Arrivals</p>
                {
                  data?
                  <p className="stat-value">{data.newArrivals}</p>
                  :
                  <div className="spinner"></div>
                }
              </div>
              <div className="stat-icon-container">
                <div className="dollar-icon">$</div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div>
                <p className="stat-label">Best Sellers</p>
                {
                  data?
                  <p className="stat-value">{data.bestSellers}</p>
                  :
                  <div className="spinner"></div>
                }
              </div>
              <div className="stat-icon-container">
                <div className="users-icon">👥</div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="main-actions">
          <h2 className="section-title">Quick Access</h2>
          <p className="section-subtitle">Manage your store efficiently</p>
          
          <div className="action-cards-grid">
            <div 
              className="action-card"
              onClick={() => navigate('/all-products')}
            >
              <div className="action-card-icon products-icon">
                <Package size={32} />
              </div>
              <h3 className="action-card-title">Products Management</h3>
              <p className="action-card-description">
                View, add, edit, and manage your product catalog. Track inventory and update product details.
              </p>
              <div className="action-card-footer">
                <span className="action-card-link">Go to Products →</span>
              </div>
            </div>

            <div 
              className="action-card"
              onClick={() => navigate('/allorders')}
            >
              <div className="action-card-icon orders-icon">
                <ShoppingCart size={32} />
              </div>
              <h3 className="action-card-title">Orders Management</h3>
              <p className="action-card-description">
                Process orders, update status, manage returns, and track customer purchases.
              </p>
              <div className="action-card-footer">
                <span className="action-card-link">Go to Orders →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const PasswordModal = ({ password, setPassword, onSubmit, error, }) => {
  
  return (
    <div className="password-modal-overlay">
      <div className={`wrong-pass ${error? "showwrong-pass":"hidewrong-pass"}`}>
        <p>Incorrect password. Please try again.</p>
      </div>
      <div className="password-modal"> 
        <div className="modal-header">
          <Shield className="modal-shield-icon" />
          <h2 className="modal-title">Admin Access Required</h2>
          <p className="modal-subtitle">Enter password to access the admin panel</p>
        </div>
        
        <form onSubmit={onSubmit} className="password-form">
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          
          <button type="submit" className="submit-btn">
            Access Dashboard
          </button>
        </form>
        
        <div className="modal-footer">
          <p className="security-note">
            ⚠️ This session will expire in 2 hours for security purposes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;