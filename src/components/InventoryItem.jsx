import React, { useState } from 'react';

const InventoryItem = ({ item, onUpdate, onDelete, categories, statuses }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(item);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onUpdate(item.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(item);
    setIsEditing(false);
  };

  const handleQuickQuantityUpdate = (newQuantity) => {
    const updatedData = { ...item, quantity: newQuantity };
    onUpdate(item.id, updatedData);
  };

  const handleQuickStatusUpdate = (newStatus) => {
    const updatedData = { ...item, status: newStatus };
    onUpdate(item.id, updatedData);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(item.id);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000); // Auto-hide after 3 seconds
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'enough': return '#22c55e';
      case 'low': return '#f59e0b';
      case 'buy': return '#ef4444';
      case 'bring': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getCategoryEmoji = (category) => {
    switch (category.toLowerCase()) {
      case 'pantry': return '🥫';
      case 'fresh food': return '🥬';
      case 'household': return '🧽';
      case 'personal care': return '🧴';
      default: return '📦';
    }
  };

  const formatLastUpdated = (updatedAt) => {
    const date = new Date(updatedAt);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  if (isEditing) {
    return (
      <div className="inventory-item editing">
        <div className="item-edit-form">
          <div className="edit-header">
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="edit-name"
            />
            <div className="edit-actions">
              <button onClick={handleSave} className="save-btn">✓</button>
              <button onClick={handleCancel} className="cancel-btn">✕</button>
            </div>
          </div>

          <div className="edit-body">
            <div className="edit-row">
              <div className="edit-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={editData.quantity}
                  onChange={(e) => setEditData({ ...editData, quantity: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="edit-group">
                <label>Max Quantity</label>
                <input
                  type="number"
                  value={editData.maxQuantity || 50}
                  onChange={(e) => setEditData({ ...editData, maxQuantity: parseFloat(e.target.value) || 50 })}
                  min="1"
                  step="1"
                />
              </div>
            </div>

            <div className="edit-row">
              <div className="edit-group">
                <label>Unit</label>
                <select
                  value={editData.unit}
                  onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
                >
                  {['items', 'lbs', 'oz', 'bottles', 'cans', 'boxes', 'bags', 'packages'].map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div className="edit-group">
                <label>Category</label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="edit-row">
              <div className="edit-group">
                <label>Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="edit-row">
              <div className="edit-group full-width">
                <label>Notes</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Add notes..."
                  rows="2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-item">
      <div className="item-header">
        <div className="item-title-section">
          <span className="category-emoji">{getCategoryEmoji(item.category)}</span>
          <h2 className="item-name">{item.name}</h2>
        </div>
        <div className="status-dropdown-container">
          <select
            value={item.status}
            onChange={(e) => handleQuickStatusUpdate(e.target.value)}
            className="status-dropdown"
            style={{
              backgroundColor: getStatusColor(item.status),
              color: 'white',
              borderColor: getStatusColor(item.status)
            }}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="item-body">
        <div className="meta-qty-row">
          <div className="item-meta">
            <span className="category-badge">{item.category}</span>
          </div>
          <div className="quantity-display">
            <span className="quantity-number">{item.quantity}</span>
            <span className="quantity-unit">{item.unit}</span>
          </div>
        </div>

        <div className="quantity-section">
          <div className="quantity-slider-container">
            <div className="slider-labels">
              <span>0</span>
              <span>{item.maxQuantity || 50}</span>
            </div>
            <input
              type="range"
              min="0"
              max={item.maxQuantity || 50}
              value={item.quantity}
              onChange={(e) => handleQuickQuantityUpdate(parseFloat(e.target.value))}
              className="quantity-slider"
              step="1"
            />
          </div>
        </div>

        {item.notes && (
          <div className="notes-section">
            <div className="notes-icon">📝</div>
            <span className="notes-label">Notes</span>
            <span className="notes-text">{item.notes || 'No notes'}</span>
          </div>
        )}

        <div className="item-footer">
          <span className="last-updated">
            Updated {formatLastUpdated(item.updatedAt)}
          </span>
          <div className="item-actions">
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              ✏️
            </button>
            <button 
              onClick={handleDelete} 
              className={`delete-btn ${showDeleteConfirm ? 'confirm' : ''}`}
            >
              {showDeleteConfirm ? '✓' : '🗑️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryItem;
