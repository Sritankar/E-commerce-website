import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Star, ShoppingCart, Tag, TrendingUp } from 'lucide-react';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 220px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ProductImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #f0f2f5, #e9ecef);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 48px;
`;

const Badge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${props => props.discount > 20 ? '#e53e3e' : '#38a169'};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const ProductCategory = styled.div`
  color: #667eea;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductBrand = styled.div`
  color: #666;
  font-size: 14px;
  margin-bottom: 0.75rem;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const SalePrice = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
`;

const MarketPrice = styled.span`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const RatingText = styled.span`
  font-size: 14px;
  color: #666;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
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
    }
  }

  &.secondary {
    background: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #edf2f7;
    }
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const ProductCard = ({ product }) => {
  const {
    id,
    product_name,
    category,
    brand,
    sale_price,
    market_price,
    rating,
    discount_percentage,
    department_name
  } = product;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={14} fill="#ffc107" color="#ffc107" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} size={14} fill="#ffc107" color="#ffc107" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<Star key={i} size={14} color="#e2e8f0" />);
      }
    }
    return stars;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to cart logic here
    console.log('Adding to cart:', product);
  };

  return (
    <StyledLink to={`/products/${id}`}>
      <Card>
        <ImageContainer>
          <ProductImage>
            📦
          </ProductImage>
          {discount_percentage > 0 && (
            <Badge discount={discount_percentage}>
              <Tag size={12} />
              {discount_percentage}% OFF
            </Badge>
          )}
        </ImageContainer>

        <CardContent>
          <ProductCategory>
            {department_name || category || 'General'}
          </ProductCategory>
          
          <ProductName>{product_name}</ProductName>
          
          {brand && (
            <ProductBrand>{brand}</ProductBrand>
          )}

          <PriceContainer>
            <SalePrice>{formatPrice(sale_price)}</SalePrice>
            {market_price && market_price > sale_price && (
              <MarketPrice>{formatPrice(market_price)}</MarketPrice>
            )}
          </PriceContainer>

          {rating && (
            <RatingContainer>
              <StarRating>
                {renderStars(rating)}
              </StarRating>
              <RatingText>({rating?.toFixed(1)})</RatingText>
            </RatingContainer>
          )}

          <CardActions>
            <ActionButton 
              className="primary" 
              onClick={handleAddToCart}
            >
              <ShoppingCart size={16} />
              Add to Cart
            </ActionButton>
          </CardActions>
        </CardContent>
      </Card>
    </StyledLink>
  );
};

export default ProductCard;
