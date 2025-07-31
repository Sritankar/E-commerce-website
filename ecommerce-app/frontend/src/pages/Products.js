import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactPaginate from 'react-paginate';

import { useProducts, useCategories, useBrands } from '../hooks/useProducts';
import { useDepartments } from '../hooks/useDepartments';
import ProductList from '../components/products/ProductList';
import ProductSearch from '../components/products/ProductSearch';
import DepartmentFilter from '../components/departments/DepartmentFilter';
import DepartmentSidebar from '../components/departments/DepartmentSidebar';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const ProductsContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const ProductsLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  min-width: 0; // Prevents grid overflow
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const ResultsInfo = styled.div`
  h2 {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .count {
    color: #666;
    font-size: 0.95rem;
  }
`;

const ViewControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f7fafc;
  border-radius: 6px;
  padding: 2px;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};

  &:hover {
    background: ${props => props.active ? '#5a6fd8' : '#edf2f7'};
  }
`;

const PerPageSelect = styled.select`
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;

  .pagination {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 0.5rem;
    align-items: center;
  }

  .page-item {
    .page-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      color: #4a5568;
      text-decoration: none;
      transition: all 0.2s;
      font-weight: 500;

      &:hover {
        background: #f7fafc;
        border-color: #cbd5e0;
      }
    }

    &.selected .page-link {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }

    &.disabled .page-link {
      opacity: 0.5;
      cursor: not-allowed;

      &:hover {
        background: transparent;
        border-color: #e2e8f0;
      }
    }

    &.previous,
    &.next {
      .page-link {
        width: auto;
        padding: 0 12px;
        gap: 0.5rem;
      }
    }
  }
`;

const NoResultsContainer = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
    color: #2d3748;
    font-size: 1.5rem;
  }

  p {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
`;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Get filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    department_id: searchParams.get('department_id') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_rating: searchParams.get('min_rating') || '',
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: searchParams.get('sort_order') || 'desc',
    page: currentPage,
    per_page: perPage
  };

  // Data fetching
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts 
  } = useProducts(filters);

  const { data: departmentsData, isLoading: departmentsLoading } = useDepartments();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  // Update page when URL changes
  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  // Update URL when filters change
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && key !== 'page' && key !== 'per_page') {
        params.set(key, value);
      }
    });

    if (newFilters.page && newFilters.page > 1) {
      params.set('page', newFilters.page);
    }

    setSearchParams(params);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (searchFilters) => {
    updateFilters({ ...searchFilters, page: 1 });
  };

  const handleFiltersChange = (newFilters) => {
    updateFilters({ ...newFilters, page: 1 });
  };

  const handleDepartmentChange = (departmentId) => {
    updateFilters({ 
      ...filters, 
      department_id: departmentId || '', 
      page: 1 
    });
  };

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1;
    setCurrentPage(newPage);
    updateFilters({ ...filters, page: newPage });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    setPerPage(newPerPage);
    updateFilters({ ...filters, per_page: newPerPage, page: 1 });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => 
      key !== 'sort_by' && 
      key !== 'sort_order' && 
      key !== 'page' && 
      key !== 'per_page' && 
      value && 
      value !== ''
    );
  };

  const getResultsTitle = () => {
    if (filters.search) {
      return `Search results for "${filters.search}"`;
    }
    if (filters.department_id) {
      const dept = departmentsData?.departments?.find(d => d.id.toString() === filters.department_id);
      return dept ? `${dept.name} Products` : 'Products';
    }
    if (filters.category) {
      return `${filters.category} Products`;
    }
    return 'All Products';
  };

  const formatResultsCount = () => {
    if (!productsData) return '';
    
    const { total, page, per_page } = productsData;
    const start = (page - 1) * per_page + 1;
    const end = Math.min(page * per_page, total);
    
    return `Showing ${start}-${end} of ${total.toLocaleString()} products`;
  };

  if (productsError) {
    return (
      <ProductsContainer>
        <ErrorMessage
          title="Failed to load products"
          message="We couldn't load the products. Please try again."
          onRetry={refetchProducts}
        />
      </ProductsContainer>
    );
  }

  return (
    <ProductsContainer>
      {/* Department Filter - Mobile/Tablet */}
      <div style={{ display: 'none' }}>
        {window.innerWidth <= 1024 && (
          <DepartmentFilter
            departments={departmentsData?.departments || []}
            selectedDepartment={filters.department_id ? parseInt(filters.department_id) : null}
            onDepartmentChange={handleDepartmentChange}
            isLoading={departmentsLoading}
          />
        )}
      </div>

      {/* Search and Filters */}
      <ProductSearch
        onSearch={handleSearch}
        categories={categories || []}
        brands={brands || []}
        departments={departmentsData?.departments || []}
        currentFilters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <ProductsLayout>
        {/* Sidebar - Desktop */}
        <div style={{ display: window.innerWidth > 1024 ? 'block' : 'none' }}>
          <DepartmentSidebar
            departments={departmentsData?.departments || []}
            selectedDepartment={filters.department_id ? parseInt(filters.department_id) : null}
            onDepartmentChange={handleDepartmentChange}
            isLoading={departmentsLoading}
          />
        </div>

        <MainContent>
          {/* Results Header */}
          <ResultsHeader>
            <ResultsInfo>
              <h2>{getResultsTitle()}</h2>
              <div className="count">
                {productsLoading ? 'Loading...' : formatResultsCount()}
              </div>
            </ResultsInfo>

            <ViewControls>
              <ViewToggle>
                <ViewButton 
                  active={view === 'grid'} 
                  onClick={() => setView('grid')}
                  title="Grid View"
                >
                  <Grid size={18} />
                </ViewButton>
                <ViewButton 
                  active={view === 'list'} 
                  onClick={() => setView('list')}
                  title="List View"
                >
                  <List size={18} />
                </ViewButton>
              </ViewToggle>

              <PerPageSelect value={perPage} onChange={handlePerPageChange}>
                <option value={12}>12 per page</option>
                <option value={20}>20 per page</option>
                <option value={40}>40 per page</option>
                <option value={60}>60 per page</option>
              </PerPageSelect>
            </ViewControls>
          </ResultsHeader>

          {/* Products List */}
          <ProductList
            products={productsData?.products || []}
            isLoading={productsLoading}
            error={productsError}
            onRetry={refetchProducts}
            onClearFilters={clearAllFilters}
            hasFilters={hasActiveFilters()}
          />

          {/* Pagination */}
          {productsData && productsData.total_pages > 1 && (
            <PaginationContainer>
              <ReactPaginate
                pageCount={productsData.total_pages}
                pageRangeDisplayed={5}
                marginPagesDisplayed={2}
                onPageChange={handlePageChange}
                forcePage={currentPage - 1}
                containerClassName="pagination"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item previous"
                nextClassName="page-item next"
                previousLinkClassName="page-link"
                nextLinkClassName="page-link"
                activeClassName="selected"
                disabledClassName="disabled"
                previousLabel={
                  <>
                    <ChevronLeft size={16} />
                    Previous
                  </>
                }
                nextLabel={
                  <>
                    Next
                    <ChevronRight size={16} />
                  </>
                }
              />
            </PaginationContainer>
          )}
        </MainContent>
      </ProductsLayout>
    </ProductsContainer>
  );
};

export default Products;

