import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Star, ShoppingCart, Tag, Heart, Package } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWatchlist } from '../../contexts/WatchlistContext';
import { formatCurrency, generateStarRating } from '../../utils/helpers';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 200px;
  overflow: hidden;
`;

const ProductImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #f0f2f5, #e9ecef);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #6c757d;
`;

const WatchlistButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${props => props.isInWatchlist ? '#e53e3e' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.isInWatchlist ? 'white' : '#666'};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    background: ${props => props.isInWatchlist ? '#c53030' : 'rgba(255, 255, 255, 1)'};
  }
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const ProductName = styled(Link)`
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  text-decoration: none;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  
  &:hover {
    color: #667eea;
  }
`;

const ProductMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #666;
`;

const Category = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Stars = styled.div`
  display: flex;
`;

const PriceSection = styled.div`
  margin-bottom: 1rem;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const SalePrice = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
`;

const MarketPrice = styled.span`
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
`;

const Discount = styled.span`
  background: #48bb78;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &.primary {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a6fd8;
      transform: translateY(-1px);
    }
    
    &:disabled {
      background: #a0aec0;
      cursor: not-allowed;
      transform: none;
    }
  }
  
  &.secondary {
    background: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #edf2f7;
      border-color: #cbd5e0;
    }
  }
`;

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    if (isInWatchlist(product.id)) {
      removeFromWatchlist(product.id);
    } else {
      addToWatchlist(product);
    }
  };

  const stars = generateStarRating(product.rating);
  const discount = product.market_price && product.sale_price
    ? Math.round(((product.market_price - product.sale_price) / product.market_price) * 100)
    : 0;

  return (
    <Card>
      <ImageContainer>
        <ProductImage>
          <Package size={32} />
        </ProductImage>
        <WatchlistButton 
          onClick={handleWatchlistToggle}
          isInWatchlist={isInWatchlist(product.id)}
          title={isInWatchlist(product.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          <Heart size={18} fill={isInWatchlist(product.id) ? 'white' : 'none'} />
        </WatchlistButton>
      </ImageContainer>

      <CardContent>
        <ProductName to={`/products/${product.id}`}>
          {product.product_name}
        </ProductName>

        <ProductMeta>
          <Category>
            <Tag size={14} />
            {product.category || 'General'}
          </Category>
          {product.rating && (
            <Rating>
              <Stars>
                {stars.map((star, index) => (
                  <Star
                    key={index}
                    size={14}
                    fill={star.type === 'full' ? '#fbbf24' : 'none'}
                    color="#fbbf24"
                  />
                ))}
              </Stars>
              <span>({product.rating})</span>
            </Rating>
          )}
        </ProductMeta>

        <PriceSection>
          <PriceContainer>
            <SalePrice>{formatCurrency(product.sale_price)}</SalePrice>
            {product.market_price && product.market_price > product.sale_price && (
              <>
                <MarketPrice>{formatCurrency(product.market_price)}</MarketPrice>
                <Discount>{discount}% OFF</Discount>
              </>
            )}
          </PriceContainer>
        </PriceSection>

        <CardActions>
          <ActionButton 
            className="primary" 
            onClick={handleAddToCart}
            disabled={isInCart(product.id)}
          >
            <ShoppingCart size={16} />
            {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
          </ActionButton>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
