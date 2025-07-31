import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowRight, Star, TrendingUp, Package, Users, ShoppingBag } from 'lucide-react';
import { useProducts, useProductStats } from '../hooks/useProducts';
import { useDepartments, useDepartmentStats } from '../hooks/useDepartments';
import ProductCard from '../components/products/ProductCard';
import { ProductListSkeleton } from '../components/common/Loading';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  border-radius: 20px;
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.5;
  }

  .content {
    position: relative;
    z-index: 1;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 16px 32px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
`;

const StatsSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 50%;
    margin-bottom: 1rem;
  }

  .value {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  .label {
    color: #666;
    font-weight: 500;
  }
`;

const Section = styled.section`
  margin-bottom: 4rem;

  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 1rem;
    text-align: center;
  }

  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  h2 {
    margin: 0;
    text-align: left;

    @media (max-width: 768px) {
      text-align: center;
    }
  }
`;

const ViewAllLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f7fafc;
    transform: translateX(4px);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
`;

const DepartmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const DepartmentCard = styled(Link)`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
  }

  .count {
    color: #667eea;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .arrow {
    color: #667eea;
    transition: transform 0.2s;
  }

  &:hover .arrow {
    transform: translateX(4px);
  }
`;

const Home = () => {
  const { data: productsData, isLoading: productsLoading } = useProducts({ 
    per_page: 8, 
    sort_by: 'created_at', 
    sort_order: 'desc' 
  });
  
  const { data: featuredData, isLoading: featuredLoading } = useProducts({ 
    per_page: 4, 
    sort_by: 'rating', 
    sort_order: 'desc',
    min_rating: 4 
  });

  const { data: departmentsData, isLoading: departmentsLoading } = useDepartments({ per_page: 6 });
  const { data: productStats } = useProductStats();
  const { data: departmentStats } = useDepartmentStats();

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  return (
    <HomeContainer>
      {/* Hero Section */}
      <HeroSection>
        <div className="content">
          <h1>Welcome to E-Commerce</h1>
          <p>
            Discover thousands of quality products from trusted brands. 
            Shop with confidence and enjoy fast, secure delivery right to your door.
          </p>
          <CTAButton to="/products">
            Start Shopping
            <ArrowRight size={20} />
          </CTAButton>
        </div>
      </HeroSection>

      {/* Stats Section */}
      <StatsSection>
        <StatCard>
          <div className="icon">
            <Package size={24} />
          </div>
          <div className="value">{formatNumber(productStats?.total_products)}</div>
          <div className="label">Products Available</div>
        </StatCard>
        
        <StatCard>
          <div className="icon">
            <ShoppingBag size={24} />
          </div>
          <div className="value">{departmentStats?.total_departments || 0}</div>
          <div className="label">Departments</div>
        </StatCard>
        
        <StatCard>
          <div className="icon">
            <Star size={24} />
          </div>
          <div className="value">{productStats?.average_rating?.toFixed(1) || '0.0'}</div>
          <div className="label">Average Rating</div>
        </StatCard>
        
        <StatCard>
          <div className="icon">
            <TrendingUp size={24} />
          </div>
          <div className="value">${formatNumber(productStats?.price_range?.max)}</div>
          <div className="label">Top Price Range</div>
        </StatCard>
      </StatsSection>

      {/* Featured Products */}
      <Section>
        <SectionHeader>
          <div>
            <h2>Featured Products</h2>
            <p className="subtitle">Top-rated products loved by our customers</p>
          </div>
          <ViewAllLink to="/products?sort_by=rating&sort_order=desc">
            View All
            <ArrowRight size={16} />
          </ViewAllLink>
        </SectionHeader>
        
        {featuredLoading ? (
          <ProductListSkeleton count={4} />
        ) : (
          <ProductGrid>
            {featuredData?.products?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        )}
      </Section>

      {/* Latest Products */}
      <Section>
        <SectionHeader>
          <div>
            <h2>Latest Arrivals</h2>
            <p className="subtitle">Newest products just added to our catalog</p>
          </div>
          <ViewAllLink to="/products?sort_by=created_at&sort_order=desc">
            View All
            <ArrowRight size={16} />
          </ViewAllLink>
        </SectionHeader>
        
        {productsLoading ? (
          <ProductListSkeleton count={8} />
        ) : (
          <ProductGrid>
            {productsData?.products?.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        )}
      </Section>

      {/* Departments */}
      <Section>
        <SectionHeader>
          <div>
            <h2>Shop by Department</h2>
            <p className="subtitle">Explore our organized product categories</p>
          </div>
          <ViewAllLink to="/products">
            View All Products
            <ArrowRight size={16} />
          </ViewAllLink>
        </SectionHeader>
        
        {departmentsLoading ? (
          <DepartmentGrid>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} style={{ 
                background: '#f8f9fa', 
                padding: '2rem', 
                borderRadius: '12px',
                animation: 'pulse 1.5s ease-in-out infinite alternate'
              }}>
                <div style={{ height: '20px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '1rem' }} />
                <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '0.5rem' }} />
                <div style={{ height: '14px', background: '#e2e8f0', borderRadius: '4px', width: '60%' }} />
              </div>
            ))}
          </DepartmentGrid>
        ) : (
          <DepartmentGrid>
            {departmentsData?.departments?.slice(0, 6).map((department) => (
              <DepartmentCard 
                key={department.id} 
                to={`/products?department_id=${department.id}`}
              >
                <div className="header">
                  <div className="name">{department.name}</div>
                  <div className="count">
                    <Package size={16} />
                    {department.product_count || 0}
                  </div>
                </div>
                <div className="description">
                  {department.description || `Explore our ${department.name.toLowerCase()} collection with quality products and competitive prices.`}
                </div>
                <div className="arrow">
                  <ArrowRight size={16} />
                </div>
              </DepartmentCard>
            ))}
          </DepartmentGrid>
        )}
      </Section>
    </HomeContainer>
  );
};

export default Home;
