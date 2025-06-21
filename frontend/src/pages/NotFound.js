import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function NotFound() {
  const [dark, setDark] = useState(() => {
    // 从 localStorage 读取暗色模式设置
    return localStorage.getItem('darkMode') === 'true';
  });
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}
         style={{ 
           backgroundImage: dark ? 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80)' : 'url(https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80)',
           backgroundAttachment: 'fixed',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundBlendMode: dark ? 'overlay' : 'soft-light',
           backgroundRepeat: 'no-repeat'
         }}>
      {/* 背景遮罩 */}
      <div className={`absolute inset-0 ${dark ? 'bg-gray-900/70' : 'bg-white/50'} backdrop-blur-sm -z-10`}></div>
      
      <div className={`${dark ? 'dark-glass-effect' : 'glass-effect'} rounded-2xl overflow-hidden shadow-xl p-10 text-center max-w-md mx-auto`}>
        <h1 className={`text-9xl font-bold ${dark ? 'text-blue-400' : 'text-blue-600'}`}>404</h1>
        
        <div className={`w-24 h-1 mx-auto my-6 ${dark ? 'bg-blue-400' : 'bg-blue-600'} rounded-full`}></div>
        
        <h2 className={`text-2xl font-semibold mb-6 ${dark ? 'text-white' : 'text-gray-800'}`}>
          页面不存在
        </h2>
        
        <p className={`mb-8 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
          您访问的页面可能已被移动、删除或不存在
        </p>
        
        <Link to="/" className={`inline-flex items-center px-6 py-3 rounded-full ${dark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-300`}>
          <ArrowLeftOutlined className="mr-2" />
          返回首页
        </Link>
      </div>
    </div>
  );
}
