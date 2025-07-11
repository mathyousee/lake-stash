import React from 'react';

const SearchAndFilter = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  categories,
  statuses,
  statusCounts
}) => {
  return (
    <div className="search-filter-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      <div className="filter-tabs">
        <div className="category-tabs">
          <span className="filter-label">Categories:</span>
          {categories.map(category => (
            <button
              key={category}
              className={`filter-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="status-tabs">
          <span className="filter-label">Status:</span>
          {statuses.map(status => (
            <button
              key={status}
              className={`filter-tab status-${status.toLowerCase()} ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => onStatusChange(status)}
            >
              {status}
              {statusCounts[status] > 0 && (
                <span className="count-badge">{statusCounts[status]}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
