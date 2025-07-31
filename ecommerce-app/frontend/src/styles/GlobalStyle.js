import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* Additional global styles specific to styled-components */
  
  .react-loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .Toastify__toast {
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
  }

  .Toastify__toast--success {
    background: #38a169;
  }

  .Toastify__toast--error {
    background: #e53e3e;
  }

  .Toastify__toast--info {
    background: #667eea;
  }

  .Toastify__toast--warning {
    background: #d69e2e;
  }

  /* React Select Styles */
  .react-select__control {
    border-color: #e2e8f0 !important;
    box-shadow: none !important;
    
    &:hover {
      border-color: #cbd5e0 !important;
    }
  }

  .react-select__control--is-focused {
    border-color: #667eea !important;
    box-shadow: 0 0 0 1px #667eea !important;
  }

  .react-select__option--is-selected {
    background-color: #667eea !important;
  }

  .react-select__option--is-focused {
    background-color: #f7fafc !important;
    color: #2d3748 !important;
  }

  /* Custom scrollbar for webkit browsers */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f7fafc;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
    
    &:hover {
      background: #a0aec0;
    }
  }

  /* Loading animation */
  .pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }

  /* Smooth transitions for all interactive elements */
  button,
  a,
  input,
  select,
  textarea {
    transition: all 0.2s ease-in-out;
  }

  /* Focus styles for accessibility */
  .focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  /* Hide outline for mouse users */
  .js-focus-visible :focus:not(.focus-visible) {
    outline: none;
  }
`;
