import React from 'react';
import styled from 'styled-components';
import ProductCard from './ProductCard';
import { ProductListSkeleton } from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 1rem;
  color: #666;

  h3 {
    margin-bottom: 1rem;
    color: #2d3748;
  }

  p {
    margin-bottom: 2rem;
    line-height: 1.6;
  }
`;

const ClearFiltersButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #5a6fd8;
    transform: translateY(-1px);
  }
`;

const ProductList = ({ 
  products = [], 
  isLoading, 
  error, 
  onRetry, 
  onClearFilters,
  hasFilters = false 
}) => {
  if (isLoading) {
    return <ProductListSkeleton count={8} />;
  }

  if (error) {
    return (
      <div style={{ gridColumn: '1 / -1' }}>
        <ErrorMessage
          title="Failed to load products"
          message="We couldn't load the products. Please try again."
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState>
        <h3>No products found</h3>
        <p>
          {hasFilters 
            ? "No products match your current filters. Try adjusting your search criteria."
            : "We couldn't find any products at the moment. Please check back later."
          }
        </p>
        {hasFilters && onClearFilters && (
          <ClearFiltersButton onClick={onClearFilters}>
            Clear All Filters
          </ClearFiltersButton>
        )}
      </EmptyState>
    );
  }

  return (
    <ListContainer>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ListContainer>
  );
};

export default ProductList;
