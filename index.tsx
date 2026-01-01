import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Reset navigation to start from the Welcome screen
window.location.hash = '/';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);