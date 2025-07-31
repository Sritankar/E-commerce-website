import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Menu, 
  X, 
  User,
  Home,
  Package
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWatchlist } from '../../contexts/WatchlistContext';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;

  @media (max-width: 768px) {
    padding: 0 1rem;
    height: 60px;
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  margin: 0 2rem;

  @media (max-width: 1024px) {
    margin: 0 1rem;
    max-width: 300px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.02);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const CartButton = styled(ActionButton)`
  &:hover {
    background: rgba(72, 187, 120, 0.3);
  }
`;

const WatchlistButton = styled(ActionButton)`
  &:hover {
    background: rgba(229, 62, 62, 0.3);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(229, 62, 62, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(229, 62, 62, 0);
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileSearchContainer = styled.div`
  display: none;
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    display: ${props => props.showSearch ? 'block' : 'none'};
  }
`;

const MobileSearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 1rem;

  &::placeholder {
    color: #666;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.5);
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1001;
  display: ${props => props.isOpen ? 'block' : 'none'};
  margin-top: 0.5rem;
`;

const UserMenuItem = styled.a`
  display: block;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  transition: background 0.2s;

  &:hover {
    background: #f7fafc;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get cart and watchlist data from contexts
  const { getCartItemCount } = useCart();
  const { getWatchlistCount } = useWatchlist();

  const cartItemCount = getCartItemCount();
  const watchlistItemCount = getWatchlistCount();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileSearch(false);
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileSearch(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        {/* Logo */}
        <Logo to="/">
          <Package size={28} />
          E-Commerce
        </Logo>

        {/* Desktop Search */}
        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchIcon size={20} />
            <SearchInput
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </SearchContainer>

        {/* Desktop Navigation */}
        <Navigation isOpen={isMenuOpen}>
          <NavLink 
            to="/" 
            className={isActive('/') ? 'active' : ''}
            onClick={() => setIsMenuOpen(false)}
          >
            <Home size={18} />
            Home
          </NavLink>
          <NavLink 
            to="/products" 
            className={isActive('/products') ? 'active' : ''}
            onClick={() => setIsMenuOpen(false)}
          >
            <Package size={18} />
            Products
          </NavLink>
        </Navigation>

        {/* User Actions */}
        <UserActions>
          {/* Mobile Search Button */}
          <ActionButton 
            onClick={toggleMobileSearch}
            style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
            title="Search"
          >
            <Search size={20} />
          </ActionButton>

          {/* Watchlist Button */}
          <WatchlistButton 
            onClick={() => navigate('/watchlist')}
            title="Watchlist"
          >
            <Heart size={20} />
            {watchlistItemCount > 0 && (
              <Badge>{watchlistItemCount > 99 ? '99+' : watchlistItemCount}</Badge>
            )}
          </WatchlistButton>

          {/* Cart Button */}
          <CartButton 
            onClick={() => navigate('/cart')}
            title="Shopping Cart"
          >
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <Badge>{cartItemCount > 99 ? '99+' : cartItemCount}</Badge>
            )}
          </CartButton>

          {/* User Menu */}
          <UserMenu>
            <ActionButton onClick={toggleUserMenu} title="Account">
              <User size={20} />
            </ActionButton>
            <UserMenuDropdown isOpen={isUserMenuOpen}>
              <UserMenuItem href="#" onClick={() => setIsUserMenuOpen(false)}>
                Profile
              </UserMenuItem>
              <UserMenuItem href="#" onClick={() => setIsUserMenuOpen(false)}>
                Orders
              </UserMenuItem>
              <UserMenuItem href="#" onClick={() => setIsUserMenuOpen(false)}>
                Settings
              </UserMenuItem>
              <UserMenuItem href="#" onClick={() => setIsUserMenuOpen(false)}>
                Logout
              </UserMenuItem>
            </UserMenuDropdown>
          </UserMenu>

          {/* Mobile Menu Button */}
          <MobileMenuButton onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </MobileMenuButton>
        </UserActions>
      </HeaderContent>

      {/* Mobile Search */}
      <MobileSearchContainer showSearch={showMobileSearch}>
        <form onSubmit={handleMobileSearch}>
          <MobileSearchInput
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </form>
      </MobileSearchContainer>
    </HeaderContainer>
  );
};

export default Header;
