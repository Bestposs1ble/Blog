import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css'; // 如果你用的是 antd v5，建议加上这行

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);