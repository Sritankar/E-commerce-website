import React from 'react';
import styled from 'styled-components';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  color: white;
  padding: 3rem 0 1rem;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FooterSection = styled.div`
  h3 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: #e2e8f0;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 0.5rem;

      a {
        color: #cbd5e0;
        text-decoration: none;
        transition: color 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:hover {
          color: white;
        }
      }
    }
  }

  p {
    color: #cbd5e0;
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #4a5568;
  padding-top: 1rem;
  text-align: center;
  color: #a0aec0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const MadeWithLove = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cbd5e0;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <h3>About E-Commerce</h3>
            <p>
              Your one-stop destination for quality products across all categories. 
              We're committed to providing the best shopping experience with 
              competitive prices and excellent customer service.
            </p>
            <p>
              Discover thousands of products from trusted brands, all in one place.
            </p>
          </FooterSection>

          <FooterSection>
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/products">All Products</a></li>
              <li><a href="/products?sort_by=sale_price&sort_order=asc">Best Deals</a></li>
              <li><a href="/products?sort_by=rating&sort_order=desc">Top Rated</a></li>
              <li><a href="/products?sort_by=created_at&sort_order=desc">New Arrivals</a></li>
            </ul>
          </FooterSection>

          <FooterSection>
            <h3>Customer Service</h3>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/returns">Returns & Exchanges</a></li>
              <li><a href="/shipping">Shipping Info</a></li>
              <li><a href="/size-guide">Size Guide</a></li>
              <li><a href="/track-order">Track Your Order</a></li>
            </ul>
          </FooterSection>

          <FooterSection>
            <h3>Contact Us</h3>
            <ul>
              <li>
                <a href="mailto:support@ecommerce.com">
                  <Mail size={16} />
                  support@ecommerce.com
                </a>
              </li>
              <li>
                <a href="tel:1-800-SHOP">
                  <Phone size={16} />
                  1-800-SHOP (7467)
                </a>
              </li>
              <li>
                <a href="/locations">
                  <MapPin size={16} />
                  Store Locations
                </a>
              </li>
            </ul>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <div>
            © 2024 E-Commerce App. All rights reserved.
          </div>
          <MadeWithLove>
            Made with <Heart size={16} color="#e53e3e" fill="#e53e3e" /> for shopping enthusiasts
          </MadeWithLove>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
