import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './scripts.js';
import Component from './App.jsx';

createRoot(document.getElementById('root')).render(<Component />);
