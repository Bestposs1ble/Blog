import React, { useEffect, useState } from 'react';
import { Button, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, MailOutlined, GithubOutlined, LinkedinOutlined } from '@ant-design/icons';
import instance from '../api';

export default function About() {
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => {
    // 从 localStorage 读取暗色模式设置
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    instance.get('/profile').then(res => setProfile(res.data.data || {}));
  }, []);

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads/')) return path;
    return `/uploads/${path.replace(/^\/+/, '')}`;
  };

  return (
    <div className={`min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}
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
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Button 
          type="primary"
          onClick={() => navigate('/')} 
          className={`mb-8 rounded-full flex items-center ${dark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} border-0 shadow-md hover:shadow-lg transition-all duration-300`}
          icon={<ArrowLeftOutlined />}
        >
          返回主页
        </Button>
        
        <div className={`${dark ? 'dark-glass-effect' : 'glass-effect'} rounded-2xl overflow-hidden shadow-xl`}>
          {/* 顶部背景图 */}
          <div 
            className="h-48 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80)` 
            }}
          />
          
          {/* 头像 - 半覆盖在背景图上 */}
          <div className="flex justify-center -mt-16 mb-4">
            <Avatar
              src={profile.avatar ? getImageUrl(profile.avatar) : undefined}
              size={120}
              className={`border-4 ${dark ? 'border-gray-800' : 'border-white'} shadow-lg`}
            />
          </div>
          
          {/* 个人信息 */}
          <div className="text-center px-6 py-6">
            <h1 className={`text-3xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-800'}`}>
              {profile.nickname || '未设置昵称'}
            </h1>
            
            <p className={`text-lg mb-6 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
              {profile.bio || '这个人很懒，还没有填写个人简介'}
            </p>
            
            <div className={`w-full h-px my-6 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            
            {/* 联系方式 */}
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <MailOutlined className={`text-xl mr-2 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
                <a 
                  href={`mailto:${profile.email}`}
                  className={`${dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-200`}
                >
                  {profile.email || 'example@example.com'}
                </a>
              </div>
              
              <div className="flex items-center justify-center">
                <GithubOutlined className={`text-xl mr-2 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
                <a 
                  href="https://github.com/Bestposs1ble" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`${dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-200`}
                >
                  @Bestposs1ble
                </a>
              </div>
            </div>
            
            <div className={`w-full h-px my-6 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            
            {/* 社交媒体图标 */}
            <div className="flex justify-center space-x-6 mt-4">
              <a 
                href="#" 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${dark ? 'bg-gray-800 text-blue-400 hover:bg-gray-700' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition-colors duration-200`}
              >
                <GithubOutlined className="text-xl" />
              </a>
              <a 
                href="#" 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${dark ? 'bg-gray-800 text-blue-400 hover:bg-gray-700' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition-colors duration-200`}
              >
                <LinkedinOutlined className="text-xl" />
              </a>
              <a 
                href="#" 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${dark ? 'bg-gray-800 text-blue-400 hover:bg-gray-700' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition-colors duration-200`}
              >
                <MailOutlined className="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}