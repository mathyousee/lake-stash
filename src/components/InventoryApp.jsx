import React, { useState, useEffect } from 'react';
import InventoryList from './InventoryList';
import AddItemForm from './AddItemForm';
import SearchAndFilter from './SearchAndFilter';

const InventoryApp = ({ user, onLogout }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const categories = ['All', 'Pantry', 'Fresh Food', 'Household', 'Personal Care', 'Other'];
  const statuses = ['All', 'Enough', 'Low', 'Buy', 'Bring'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
      
      if (response.status === 401) {
        onLogout();
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        console.error('Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      if (response.ok) {
        const newItem = await response.json();
        setItems(prev => [newItem, ...prev]);
        setShowAddForm(false);
      } else {
        console.error('Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const updateItem = async (itemId, updateData) => {
    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      if (response.ok) {
        const updatedItem = await response.json();
        setItems(prev => prev.map(item => 
          item.id === itemId ? updatedItem : item
        ));
      } else {
        console.error('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      if (response.ok || response.status === 204) {
        setItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleLogout = () => {
    window.location.href = '/.auth/logout';
  };

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = { All: items.length };
    statuses.slice(1).forEach(status => {
      counts[status] = items.filter(item => item.status === status).length;
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="loading-spinner"></div>
        <p>Loading your inventory...</p>
      </div>
    );
  }

  return (
    <div className="inventory-app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏠 Lake Stash</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user.name}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="main-content">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            categories={categories}
            statuses={statuses}
            statusCounts={getStatusCounts()}
          />

          <div className="inventory-header">
            <div className="inventory-stats">
              <span>{filteredItems.length} items</span>
              {filteredItems.length !== items.length && (
                <span className="filtered-count">
                  (filtered from {items.length})
                </span>
              )}
            </div>
            <button 
              className="add-item-btn"
              onClick={() => setShowAddForm(true)}
            >
              + Add Item
            </button>
          </div>

          {showAddForm && (
            <AddItemForm
              onSubmit={addItem}
              onCancel={() => setShowAddForm(false)}
              categories={categories.slice(1)} // Remove 'All'
              statuses={statuses.slice(1)} // Remove 'All'
            />
          )}

          <InventoryList
            items={filteredItems}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
            categories={categories.slice(1)}
            statuses={statuses.slice(1)}
          />
        </div>
      </main>
    </div>
  );
};

export default InventoryApp;
