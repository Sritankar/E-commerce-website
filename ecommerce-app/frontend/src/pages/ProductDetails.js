import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Home, Package } from 'lucide-react';

import { useProduct } from '../hooks/useProducts';
import ProductDetail from '../components/products/ProductDetail';
import { ProductDetailSkeleton } from '../components/common/Loading';
import ErrorMessage, { ProductNotFound } from '../components/common/ErrorMessage';

const DetailsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 1rem 0;
  font-size: 14px;

  a {
    color: #667eea;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: color 0.2s;

    &:hover {
      color: #5a6fd8;
    }
  }

  .separator {
    color: #cbd5e0;
  }

  .current {
    color: #4a5568;
    font-weight: 500;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  color: #4a5568;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  margin-bottom: 2rem;

  &:hover {
    border-color: #cbd5e0;
    transform: translateX(-2px);
  }
`;

const RelatedSection = styled.section`
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const RelatedCard = styled(Link)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;

  &:hover {
    border-color: #cbd5e0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .image {
    height: 120px;
    background: linear-gradient(45deg, #f0f2f5, #e9ecef);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: #6c757d;
    margin-bottom: 0.75rem;
  }

  .name {
    font-weight: 500;
    margin-bottom: 0.25rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .price {
    color: #667eea;
    font-weight: 600;
  }
`;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    data: product, 
    isLoading, 
    error,
    refetch 
  } = useProduct(id);

  const handleBack = () => {
    // Go back to previous page or products page
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/products');
    }
  };

  if (isLoading) {
    return (
      <DetailsContainer>
        <Breadcrumb>
          <Link to="/">
            <Home size={14} />
            Home
          </Link>
          <span className="separator">/</span>
          <Link to="/products">Products</Link>
          <span className="separator">/</span>
          <span className="current">Loading...</span>
        </Breadcrumb>
        <ProductDetailSkeleton />
      </DetailsContainer>
    );
  }

  if (error) {
    if (error.response?.status === 404) {
      return (
        <DetailsContainer>
          <ProductNotFound />
        </DetailsContainer>
      );
    }

    return (
      <DetailsContainer>
        <ErrorMessage
          title="Failed to load product"
          message="We couldn't load the product details. Please try again."
          onRetry={refetch}
        />
      </DetailsContainer>
    );
  }

  if (!product) {
    return (
      <DetailsContainer>
        <ProductNotFound />
      </DetailsContainer>
    );
  }

  return (
    <DetailsContainer>
      {/* Breadcrumb */}
      <Breadcrumb>
        <Link to="/">
          <Home size={14} />
          Home
        </Link>
        <span className="separator">/</span>
        <Link to="/products">Products</Link>
        {product.department_name && (
          <>
            <span className="separator">/</span>
            <Link to={`/products?department_id=${product.department_id}`}>
              {product.department_name}
            </Link>
          </>
        )}
        {product.category && (
          <>
            <span className="separator">/</span>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`}>
              {product.category}
            </Link>
          </>
        )}
        <span className="separator">/</span>
        <span className="current">{product.product_name}</span>
      </Breadcrumb>

      {/* Back Button */}
      <BackButton onClick={handleBack}>
        <ArrowLeft size={16} />
        Back to Products
      </BackButton>

      {/* Product Detail */}
      <ProductDetail product={product} />

      {/* Related Products Section */}
      <RelatedSection>
        <h3>You might also like</h3>
        <RelatedGrid>
          {/* Placeholder for related products */}
          {Array.from({ length: 4 }, (_, index) => (
            <RelatedCard key={index} to={`/products/${index + 1}`}>
              <div className="image">
                <Package size={32} />
              </div>
              <div className="name">Related Product {index + 1}</div>
              <div className="price">$99.99</div>
            </RelatedCard>
          ))}
        </RelatedGrid>
      </RelatedSection>
    </DetailsContainer>
  );
};

export default ProductDetails;
