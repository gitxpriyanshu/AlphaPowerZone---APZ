import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

console.log('Main.tsx is executing...');
const container = document.getElementById('root');
console.log('Root container found:', !!container);

if (!container) {
  console.error('Root container NOT found in the DOM!');
  throw new Error('Root container not found');
}

console.log('Starting React render...');
createRoot(container).render(
  <App />
)
console.log('Render call completed.');
