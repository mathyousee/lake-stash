import React from 'react';
import InventoryItem from './InventoryItem';

const InventoryList = ({ items, onUpdateItem, onDeleteItem, categories, statuses }) => {
  if (items.length === 0) {
    return (
      <div className="empty-inventory">
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <h3>No items found</h3>
          <p>Start by adding your first inventory item!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-list">
      {items.map(item => (
        <InventoryItem
          key={item.id}
          item={item}
          onUpdate={onUpdateItem}
          onDelete={onDeleteItem}
          categories={categories}
          statuses={statuses}
        />
      ))}
    </div>
  );
};

export default InventoryList;
