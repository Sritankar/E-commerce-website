import React, { useState } from 'react';
import styled from 'styled-components';
import { Star, ShoppingCart, Heart, Share2, Tag, TrendingUp, Package, Shield, Truck } from 'lucide-react';

const DetailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImageSection = styled.div``;

const MainImage = styled.div`
  height: 400px;
  background: linear-gradient(45deg, #f0f2f5, #e9ecef);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  color: #6c757d;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
`;

const Badge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${props => props.discount > 20 ? '#e53e3e' : '#38a169'};
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
`;

const Thumbnail = styled.div`
  height: 80px;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #6c757d;
  transition: all 0.2s;
  border: 2px solid ${props => props.active ? '#667eea' : 'transparent'};

  &:hover {
    border-color: #667eea;
  }
`;

const ProductInfo = styled.div``;

const ProductCategory = styled.div`
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const ProductTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ProductBrand = styled.div`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RatingText = styled.span`
  font-size: 1rem;
  color: #666;
  font-weight: 500;
`;

const PriceSection = styled.div`
  margin-bottom: 2rem;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const SalePrice = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
`;

const MarketPrice = styled.span`
  font-size: 1.25rem;
  color: #999;
  text-decoration: line-through;
`;

const Savings = styled.div`
  color: #38a169;
  font-weight: 600;
  font-size: 1rem;
`;

const Description = styled.div`
  margin-bottom: 2rem;

  h3 {
    margin-bottom: 1rem;
    color: #2d3748;
  }

  p {
    color: #666;
    line-height: 1.6;
  }
`;

const ActionsSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 140px;
  justify-content: center;

  &.primary {
    background: #667eea;
    color: white;

    &:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
    }
  }

  &.secondary {
    background: white;
    color: #4a5568;
    border: 2px solid #e2e8f0;

    &:hover {
      border-color: #cbd5e0;
      transform: translateY(-2px);
    }
  }
`;

const FeaturesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;

  .icon {
    color: #667eea;
  }

  .content {
    h4 {
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: #2d3748;
    }

    p {
      font-size: 0.8rem;
      color: #666;
    }
  }
`;

const ProductDetail = ({ product }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const {
    product_name,
    category,
    brand,
    sale_price,
    market_price,
    rating,
    description,
    discount_percentage,
    department_name
  } = product;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={18} fill="#ffc107" color="#ffc107" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} size={18} fill="#ffc107" color="#ffc107" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<Star key={i} size={18} color="#e2e8f0" />);
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

  const handleAddToCart = () => {
    console.log('Adding to cart:', { product, quantity });
  };

  const handleAddToWishlist = () => {
    console.log('Adding to wishlist:', product);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product_name,
        text: `Check out this product: ${product_name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <DetailContainer>
      <ProductGrid>
        <ImageSection>
          <MainImage>
            📦
            {discount_percentage > 0 && (
              <Badge discount={discount_percentage}>
                <Tag size={16} />
                {discount_percentage}% OFF
              </Badge>
            )}
          </MainImage>
          <ThumbnailGrid>
            {[0, 1, 2, 3].map((index) => (
              <Thumbnail
                key={index}
                active={activeImage === index}
                onClick={() => setActiveImage(index)}
              >
                📦
              </Thumbnail>
            ))}
          </ThumbnailGrid>
        </ImageSection>

        <ProductInfo>
          <ProductCategory>
            {department_name || category || 'General'}
          </ProductCategory>
          
          <ProductTitle>{product_name}</ProductTitle>
          
          {brand && (
            <ProductBrand>by {brand}</ProductBrand>
          )}

          {rating && (
            <RatingSection>
              <StarRating>
                {renderStars(rating)}
              </StarRating>
              <RatingText>{rating?.toFixed(1)} out of 5</RatingText>
            </RatingSection>
          )}

          <PriceSection>
            <PriceContainer>
              <SalePrice>{formatPrice(sale_price)}</SalePrice>
              {market_price && market_price > sale_price && (
                <MarketPrice>{formatPrice(market_price)}</MarketPrice>
              )}
            </PriceContainer>
            {discount_percentage > 0 && (
              <Savings>
                You save {formatPrice(market_price - sale_price)} ({discount_percentage}% off)
              </Savings>
            )}
          </PriceSection>

          {description && (
            <Description>
              <h3>Product Description</h3>
              <p>{description}</p>
            </Description>
          )}

          <ActionsSection>
            <ActionButton className="primary" onClick={handleAddToCart}>
              <ShoppingCart size={18} />
              Add to Cart
            </ActionButton>
            <ActionButton className="secondary" onClick={handleAddToWishlist}>
              <Heart size={18} />
              Wishlist
            </ActionButton>
            <ActionButton className="secondary" onClick={handleShare}>
              <Share2 size={18} />
              Share
            </ActionButton>
          </ActionsSection>
        </ProductInfo>
      </ProductGrid>

      <FeaturesSection>
        <Feature>
          <Package size={24} className="icon" />
          <div className="content">
            <h4>Free Shipping</h4>
            <p>On orders over $50</p>
          </div>
        </Feature>
        <Feature>
          <Shield size={24} className="icon" />
          <div className="content">
            <h4>Secure Payment</h4>
            <p>100% secure transactions</p>
          </div>
        </Feature>
        <Feature>
          <Truck size={24} className="icon" />
          <div className="content">
            <h4>Fast Delivery</h4>
            <p>2-5 business days</p>
          </div>
        </Feature>
        <Feature>
          <TrendingUp size={24} className="icon" />
          <div className="content">
            <h4>Best Quality</h4>
            <p>Premium products only</p>
          </div>
        </Feature>
      </FeaturesSection>
    </DetailContainer>
  );
};

export default ProductDetail;
