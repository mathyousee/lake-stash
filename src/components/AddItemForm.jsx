import React, { useState } from 'react';

const AddItemForm = ({ onSubmit, onCancel, categories, statuses }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    maxQuantity: 50,
    unit: 'items',
    category: 'Pantry',
    status: 'Enough',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.quantity !== '') {
      onSubmit({
        ...formData,
        quantity: parseFloat(formData.quantity) || 0,
        maxQuantity: parseFloat(formData.maxQuantity) || 50
      });
      setFormData({
        name: '',
        quantity: '',
        maxQuantity: 50,
        unit: 'items',
        category: 'Pantry',
        status: 'Enough',
        notes: ''
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const unitOptions = ['items', 'lbs', 'oz', 'bottles', 'cans', 'boxes', 'bags', 'packages'];

  return (
    <div className="add-item-overlay">
      <div className="add-item-form">
        <div className="form-header">
          <h3>Add New Item</h3>
          <button onClick={onCancel} className="close-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Item Name *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Olive Oil, Paper Towels"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="maxQuantity">Max Quantity</label>
              <input
                id="maxQuantity"
                type="number"
                value={formData.maxQuantity}
                onChange={(e) => handleChange('maxQuantity', e.target.value)}
                placeholder="50"
                min="1"
                step="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
              >
                {unitOptions.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Optional notes or details..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemForm;
