import React, { useState, useEffect } from 'react';

const FiltersSection = ({ 
  filters, 
  onFilterChange, 
  searchPlaceholder = "Search...",
  filterOptions = [],
  sortOptions = []
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalFilters(prev => ({ ...prev, search: value }));
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onFilterChange({ ...localFilters, search: value });
    }, 300);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      sort: 'order'
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = localFilters.search || localFilters.status || localFilters.sort !== 'order';

  return (
    <div className="filters-section">
      <div className="filters-row">
        <div className="filter-group">
          <label className="form-label" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            type="text"
            className="form-input"
            value={localFilters.search}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>

        {filterOptions.length > 0 && (
          <div className="filter-group">
            <label className="form-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="form-input "
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {sortOptions.length > 0 && (
          <div className="filter-group">
            <label className="form-label" htmlFor="sort">
              Sort By
            </label>
            <select
              id="sort"
              className="form-input"
              value={localFilters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-group" style={{ display: 'flex', alignItems: 'end' }}>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-outline"
              style={{ marginRight: '0.5rem' }}
            >
              Clear Filters
            </button>
          )}
          <div style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
            {hasActiveFilters ? 'Filters applied' : 'No filters'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSection;
