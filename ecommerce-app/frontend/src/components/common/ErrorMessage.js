import React from 'react';
import styled from 'styled-components';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  min-height: ${props => props.minHeight || '300px'};
`;

const ErrorIcon = styled.div`
  color: #e53e3e;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ErrorDescription = styled.p`
  color: #666;
  margin-bottom: 2rem;
  max-width: 400px;
  line-height: 1.6;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;

  &.primary {
    background: #667eea;
    color: white;

    &:hover {
      background: #5a6fd8;
      transform: translateY(-1px);
    }
  }

  &.secondary {
    background: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #edf2f7;
      transform: translateY(-1px);
    }
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;

  &:hover {
    background: #edf2f7;
    transform: translateY(-1px);
  }
`;

const ErrorMessage = ({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading this content.", 
  onRetry, 
  showHomeLink = true,
  minHeight 
}) => {
  return (
    <ErrorContainer minHeight={minHeight}>
      <ErrorIcon>
        <AlertCircle size={48} />
      </ErrorIcon>
      <ErrorTitle>{title}</ErrorTitle>
      <ErrorDescription>{message}</ErrorDescription>
      <ErrorActions>
        {onRetry && (
          <ActionButton className="primary" onClick={onRetry}>
            <RefreshCw size={16} />
            Try Again
          </ActionButton>
        )}
        {showHomeLink && (
          <StyledLink to="/">
            <Home size={16} />
            Go Home
          </StyledLink>
        )}
      </ErrorActions>
    </ErrorContainer>
  );
};

// Specific error components
export const NetworkError = ({ onRetry }) => (
  <ErrorMessage
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

export const NotFoundError = () => (
  <ErrorMessage
    title="Page Not Found"
    message="The page you're looking for doesn't exist. It might have been moved or deleted."
    showHomeLink={true}
  />
);

export const ProductNotFound = () => (
  <ErrorMessage
    title="Product Not Found"
    message="The product you're looking for doesn't exist or has been removed."
    showHomeLink={true}
  />
);

export const APIError = ({ error, onRetry }) => {
  const getErrorMessage = (error) => {
    if (error?.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error?.message) {
      return error.message;
    }
    return "An unexpected error occurred. Please try again.";
  };

  return (
    <ErrorMessage
      title="Error"
      message={getErrorMessage(error)}
      onRetry={onRetry}
    />
  );
};

export default ErrorMessage;
