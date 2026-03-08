import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Log API base URL for debugging
if (import.meta.env.DEV) {
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');
}

// Handle unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

