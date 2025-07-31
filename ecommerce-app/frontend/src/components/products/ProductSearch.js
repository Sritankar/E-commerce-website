import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

const SearchContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px;
  padding-right: 50px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #667eea;
  border: none;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5a6fd8;
  }
`;

const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 20px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #4a5568;
  transition: all 0.2s;

  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
  }

  &.active {
    background: #667eea;
    border-color: #667eea;
    color: white;
  }
`;

const FiltersContainer = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
  margin-top: 1rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  h4 {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: #2d3748;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #4a5568;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #667eea;
  }
`;

const RangeInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const RangeInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #667eea;
  }
`;

const ActiveFiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;

const RemoveFilter = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;

  &:hover {
    opacity: 0.8;
  }
`;

const ClearAllButton = styled.button`
  background: none;
  border: 1px solid #e53e3e;
  color: #e53e3e;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #e53e3e;
    color: white;
  }
`;

const ProductSearch = ({ 
  onSearch, 
  categories = [], 
  brands = [], 
  departments = [],
  currentFilters = {},
  onFiltersChange 
}) => {
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: currentFilters.category || '',
    brand: currentFilters.brand || '',
    department_id: currentFilters.department_id || '',
    min_price: currentFilters.min_price || '',
    max_price: currentFilters.max_price || '',
    min_rating: currentFilters.min_rating || '',
    sort_by: currentFilters.sort_by || 'created_at',
    sort_order: currentFilters.sort_order || 'desc'
  });

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      ...currentFilters
    }));
    setSearchQuery(currentFilters.search || '');
  }, [currentFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ ...filters, search: searchQuery });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    onFiltersChange({ ...newFilters, search: searchQuery });
  };

  const removeFilter = (key) => {
    const newFilters = { ...filters };
    newFilters[key] = '';
    setFilters(newFilters);
    onFiltersChange({ ...newFilters, search: searchQuery });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: '',
      brand: '',
      department_id: '',
      min_price: '',
      max_price: '',
      min_rating: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    setFilters(clearedFilters);
    setSearchQuery('');
    onFiltersChange({ ...clearedFilters, search: '' });
  };

  const getActiveFilters = () => {
    const active = [];
    
    if (searchQuery) active.push({ key: 'search', label: `Search: "${searchQuery}"`, value: searchQuery });
    if (filters.category) active.push({ key: 'category', label: `Category: ${filters.category}`, value: filters.category });
    if (filters.brand) active.push({ key: 'brand', label: `Brand: ${filters.brand}`, value: filters.brand });
    if (filters.department_id) {
      const dept = departments.find(d => d.id.toString() === filters.department_id.toString());
      active.push({ key: 'department_id', label: `Department: ${dept?.name || filters.department_id}`, value: filters.department_id });
    }
    if (filters.min_price) active.push({ key: 'min_price', label: `Min Price: $${filters.min_price}`, value: filters.min_price });
    if (filters.max_price) active.push({ key: 'max_price', label: `Max Price: $${filters.max_price}`, value: filters.max_price });
    if (filters.min_rating) active.push({ key: 'min_rating', label: `Min Rating: ${filters.min_rating}★`, value: filters.min_rating });
    
    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <SearchContainer>
      <SearchRow>
        <SearchInputContainer>
          <form onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchButton type="submit">
              <Search size={18} />
            </SearchButton>
          </form>
        </SearchInputContainer>
        
        <FilterToggle 
          className={filtersOpen ? 'active' : ''}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={18} />
          Filters
        </FilterToggle>
      </SearchRow>

      {activeFilters.length > 0 && (
        <ActiveFiltersContainer>
          {activeFilters.map((filter) => (
            <FilterTag key={filter.key}>
              {filter.label}
              <RemoveFilter onClick={() => {
                if (filter.key === 'search') {
                  setSearchQuery('');
                  onSearch({ ...filters, search: '' });
                } else {
                  removeFilter(filter.key);
                }
              }}>
                <X size={12} />
              </RemoveFilter>
            </FilterTag>
          ))}
          <ClearAllButton onClick={clearAllFilters}>
            Clear All
          </ClearAllButton>
        </ActiveFiltersContainer>
      )}

      <FiltersContainer isOpen={filtersOpen}>
        <FiltersGrid>
          <FilterGroup>
            <h4>Category</h4>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <h4>Brand</h4>
            <Select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <h4>Department</h4>
            <Select
              value={filters.department_id}
              onChange={(e) => handleFilterChange('department_id', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <h4>Price Range</h4>
            <RangeInputContainer>
              <RangeInput
                type="number"
                placeholder="Min"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
              />
              <span>-</span>
              <RangeInput
                type="number"
                placeholder="Max"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
              />
            </RangeInputContainer>
          </FilterGroup>

          <FilterGroup>
            <h4>Minimum Rating</h4>
            <Select
              value={filters.min_rating}
              onChange={(e) => handleFilterChange('min_rating', e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="4">4★ & above</option>
              <option value="3">3★ & above</option>
              <option value="2">2★ & above</option>
              <option value="1">1★ & above</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <h4>Sort By</h4>
            <Select
              value={`${filters.sort_by}-${filters.sort_order}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sort_by', sortBy);
                handleFilterChange('sort_order', sortOrder);
              }}
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="sale_price-asc">Price: Low to High</option>
              <option value="sale_price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="product_name-asc">Name: A to Z</option>
              <option value="product_name-desc">Name: Z to A</option>
            </Select>
          </FilterGroup>
        </FiltersGrid>
      </FiltersContainer>
    </SearchContainer>
  );
};

export default ProductSearch;
