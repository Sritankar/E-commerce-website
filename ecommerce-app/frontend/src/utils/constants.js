// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'E-Commerce App',
  VERSION: '1.0.0',
  DESCRIPTION: 'A modern e-commerce application',
  AUTHOR: 'E-Commerce Team',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [12, 20, 40, 60],
  MAX_PAGE_SIZE: 100,
};

// Product Configuration
export const PRODUCT_CONFIG = {
  DEFAULT_SORT_BY: 'created_at',
  DEFAULT_SORT_ORDER: 'desc',
  SORT_OPTIONS: [
    { value: 'created_at-desc', label: 'Newest First' },
    { value: 'created_at-asc', label: 'Oldest First' },
    { value: 'sale_price-asc', label: 'Price: Low to High' },
    { value: 'sale_price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'product_name-asc', label: 'Name: A to Z' },
    { value: 'product_name-desc', label: 'Name: Z to A' },
  ],
  RATING_OPTIONS: [
    { value: '', label: 'Any Rating' },
    { value: '4', label: '4★ & above' },
    { value: '3', label: '3★ & above' },
    { value: '2', label: '2★ & above' },
    { value: '1', label: '1★ & above' },
  ],
};

// UI Configuration
export const UI_CONFIG = {
  BREAKPOINTS: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '1024px',
    xl: '1200px',
    xxl: '1400px',
  },
  COLORS: {
    primary: '#667eea',
    primaryDark: '#5a6fd8',
    secondary: '#764ba2',
    success: '#38a169',
    error: '#e53e3e',
    warning: '#d69e2e',
    info: '#3182ce',
  },
  SHADOWS: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  BORDER_RADIUS: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  TRANSITIONS: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  CART: 'ecommerce_cart',
  WISHLIST: 'ecommerce_wishlist',
  USER_PREFERENCES: 'ecommerce_user_preferences',
  SEARCH_HISTORY: 'ecommerce_search_history',
  THEME: 'ecommerce_theme',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  SERVER: 'Server error. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access to this resource is forbidden.',
  VALIDATION: 'Please check your input and try again.',
  GENERIC: 'Something went wrong. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PRODUCT_ADDED_TO_CART: 'Product added to cart successfully!',
  PRODUCT_ADDED_TO_WISHLIST: 'Product added to wishlist!',
  PRODUCT_REMOVED_FROM_CART: 'Product removed from cart.',
  PRODUCT_REMOVED_FROM_WISHLIST: 'Product removed from wishlist.',
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY [at] h:mm A',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
};

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  URL: /^https?:\/\/.+/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Feature Flags
export const FEATURES = {
  WISHLIST_ENABLED: true,
  REVIEWS_ENABLED: true,
  RECOMMENDATIONS_ENABLED: true,
  SOCIAL_SHARING_ENABLED: true,
  DARK_MODE_ENABLED: false,
  PWA_ENABLED: true,
};

export default {
  API_CONFIG,
  APP_CONFIG,
  PAGINATION,
  PRODUCT_CONFIG,
  UI_CONFIG,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STATES,
  HTTP_STATUS,
  UPLOAD_CONFIG,
  DATE_FORMATS,
  REGEX_PATTERNS,
  FEATURES,
};
