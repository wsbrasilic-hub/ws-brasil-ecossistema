
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Removendo StrictMode para evitar conflitos de dispatcher no dispatcher do React 19
// em ambientes de importação dinâmica.
root.render(<App />);
