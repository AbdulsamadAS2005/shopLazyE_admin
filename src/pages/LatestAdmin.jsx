import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

const LatestAdmin = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [latestValue, setLatestValue] = useState('');
    const [currentLatest, setCurrentLatest] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [fetchLoading, setFetchLoading] = useState(true);

    const apiURL = import.meta.env.VITE_Backend;

    // Fetch current latest value
    useEffect(() => {
        fetchCurrentLatest();
    }, []);

    const fetchCurrentLatest = async () => {
  try {
    setFetchLoading(true);
    const response = await fetch(`${apiURL}/getLatest`);

    const data = await response.json();
    console.log("API RAW RESPONSE:", data);

    if (data.length > 0 && data[0].Latest) {
      setCurrentLatest(data[0].Latest);
      setLatestValue(data[0].Latest);
    } else {
      setCurrentLatest('No value set');
    }
  } catch (error) {
    console.error('Error fetching latest:', error);
  } finally {
    setFetchLoading(false);
  }
};


    const handleSave = async () => {
        if (!latestValue.trim()) {
            setMessage({
                type: 'error',
                text: 'Please enter a value'
            });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${apiURL}/setLatest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ latest: latestValue })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(response);
                
                setCurrentLatest(latestValue);
                setIsEditing(false);
                setMessage({
                    type: 'success',
                    text: data.message || 'Latest value updated successfully!'
                });

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            console.error('Error updating latest:', error);
            setMessage({
                type: 'error',
                text: 'Failed to update latest value'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setLatestValue(currentLatest);
        setIsEditing(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="latest-admin-container">
            <div className="latest-admin-card">
                <div className="latest-admin-header">
                    <div className="latest-admin-title-section">
                        <div className="latest-admin-icon">
                            <Edit2 size={24} />
                        </div>
                        <div>
                            <h3 className="latest-admin-title">Text to show on top of website</h3>
                            <p className="latest-admin-subtitle">
                                Control the featured or latest value across your application
                            </p>
                        </div>
                    </div>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="edit-latest-btn"
                        >
                            <Edit2 size={18} />
                            Edit Latest
                        </button>
                    )}
                </div>

                {/* Current Value Display */}
                <div className="current-value-section">
                    <div className="current-value-label">Current Latest Value:</div>
                    {fetchLoading ? (
                        <div className="loading-skeleton">
                            <div className="skeleton-line"></div>
                        </div>
                    ) : (
                        <div className="current-value-display">
                            {currentLatest || 'No value set'}
                        </div>
                    )}
                </div>

                {/* Edit Form */}
                {isEditing && (
                    <div className="edit-form-container">
                        <div className="form-group">
                            <label className="form-label">
                                Enter New Latest Value
                                <span className="required-asterisk">*</span>
                            </label>
                            <div className="input-with-btn">
                                <input
                                    type="text"
                                    value={latestValue}
                                    onChange={(e) => setLatestValue(e.target.value)}
                                    className="latest-input"
                                    placeholder="Enter the latest value..."
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !loading) handleSave();
                                        if (e.key === 'Escape') handleCancel();
                                    }}
                                />
                                <div className="input-actions">
                                    <button
                                        onClick={handleCancel}
                                        className="cancel-btn"
                                        disabled={loading}
                                    >
                                        <X size={18} />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="save-btn"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="spinner-small"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="input-hint">
                                Press Enter to save, Escape to cancel
                            </div>
                        </div>
                    </div>
                )}

                {/* Message Display */}
                {message.text && (
                    <div className={`message-alert ${message.type}`}>
                        <div className="message-icon">
                            {message.type === 'success' ? (
                                <CheckCircle size={20} />
                            ) : message.type === 'error' ? (
                                <AlertCircle size={20} />
                            ) : null}
                        </div>
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Info Panel */}
                <div className="info-panel">
                    <div className="info-item">
                        <div className="info-dot"></div>
                        <span>This value is used across the application</span>
                    </div>
                    <div className="info-item">
                        <div className="info-dot"></div>
                        <span>Changes take effect immediately</span>
                    </div>
                    <div className="info-item">
                        <div className="info-dot"></div>
                        <span>Make sure the value is meaningful and up-to-date</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LatestAdmin;
