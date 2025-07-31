import React from 'react';
import styled, { keyframes } from 'styled-components';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: ${props => props.minHeight || '200px'};
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-left: 1rem;
  color: #666;
  font-size: 1rem;
`;

// Generic Loading Component
export const Loading = ({ size, minHeight, text = "Loading..." }) => (
  <LoadingContainer minHeight={minHeight}>
    <Spinner size={size} />
    {text && <LoadingText>{text}</LoadingText>}
  </LoadingContainer>
);

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <SkeletonTheme baseColor="#f0f0f0" highlightColor="#e0e0e0">
    <div style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      <Skeleton height={200} style={{ marginBottom: '1rem' }} />
      <Skeleton height={20} style={{ marginBottom: '0.5rem' }} />
      <Skeleton height={16} width="60%" style={{ marginBottom: '0.5rem' }} />
      <Skeleton height={18} width="40%" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton height={20} width="30%" />
        <Skeleton height={32} width="80px" />
      </div>
    </div>
  </SkeletonTheme>
);

// Product List Skeleton
export const ProductListSkeleton = ({ count = 8 }) => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
    gap: '1rem',
    padding: '1rem'
  }}>
    {Array.from({ length: count }, (_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Product Detail Skeleton
export const ProductDetailSkeleton = () => (
  <SkeletonTheme baseColor="#f0f0f0" highlightColor="#e0e0e0">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
      <div>
        <Skeleton height={400} style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} height={60} width={60} />
          ))}
        </div>
      </div>
      <div>
        <Skeleton height={30} style={{ marginBottom: '1rem' }} />
        <Skeleton height={20} width="40%" style={{ marginBottom: '1rem' }} />
        <Skeleton height={25} width="30%" style={{ marginBottom: '1rem' }} />
        <Skeleton height={16} count={3} style={{ marginBottom: '1rem' }} />
        <Skeleton height={40} width="50%" style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Skeleton height={45} width={120} />
          <Skeleton height={45} width={100} />
        </div>
      </div>
    </div>
  </SkeletonTheme>
);

export default Loading;
