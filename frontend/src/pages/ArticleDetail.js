import React, { useEffect, useState } from 'react';
import { Button, Tag, Avatar, message, Tooltip } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartFilled, CalendarOutlined, EyeOutlined, ArrowLeftOutlined, ShareAltOutlined, UserOutlined } from '@ant-design/icons';
import instance from '../api';
import '../styles/ArticleDetail.css';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [profile, setProfile] = useState({});
  const [likes, setLikes] = useState(0);
  const [likeAnim, setLikeAnim] = useState(false);
  const [dark, setDark] = useState(() => {
    // 从 localStorage 读取暗色模式设置
    return localStorage.getItem('darkMode') === 'true';
  });
  
  useEffect(() => {
    // 获取文章详情
    instance.get(`/article/${id}`).then(res => {
      if (res.data.code === 0) {
        setArticle(res.data.data || {});
        setLikes(res.data.data.likes || 0);
      } else {
        message.error('获取文章失败');
        navigate('/');
      }
    });
    
    // 获取个人信息
    instance.get('/profile').then(res => setProfile(res.data.data || {}));
  }, [id, navigate]);

  const handleLike = () => {
    setLikeAnim(true);
    setLikes(likes + 1); // 本地立即+1
    instance.post(`/article/${id}/like`).then(res => {
      if (res.data.code === 0) setLikes(res.data.likes);
    });
    setTimeout(() => setLikeAnim(false), 500); // 动画500ms
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('链接已复制到剪贴板');
  };

  // 处理图片URL
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads/')) return path;
    return `/uploads/${path.replace(/^\/+/, '')}`;
  };

  // 格式化日期
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('zh-CN', options);
  };

  if (!article) return null;

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
      
      {/* 主体内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className={`${dark ? 'dark-glass-effect' : 'glass-effect'} rounded-2xl overflow-hidden shadow-xl`}>
          {/* 返回按钮 */}
          <div className="px-6 pt-6">
            <Button 
              type="primary"
              onClick={() => navigate('/')} 
              className={`rounded-full flex items-center ${dark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} border-0 shadow-md hover:shadow-lg transition-all duration-300`}
              icon={<ArrowLeftOutlined />}
            >
              返回首页
            </Button>
          </div>
          
          {/* 封面图 */}
          {article.cover && (
            <div className="mt-6 px-6">
              <div className="w-full h-80 rounded-xl overflow-hidden shadow-lg">
                <img
                  alt="cover"
                  src={getImageUrl(article.cover)}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          )}
          
          {/* 文章头部 */}
          <div className="px-6 pt-8">
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>
              {article.title}
            </h1>
            
            {/* 文章元信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
              <div className={`flex items-center ${dark ? 'text-blue-300' : 'text-blue-600'}`}>
                <CalendarOutlined className="mr-1" /> 
                {formatDate(article.created_at)}
              </div>
              
              <div className={`flex items-center ${dark ? 'text-blue-300' : 'text-blue-600'}`}>
                <EyeOutlined className="mr-1" /> 
                {article.views || 0} 阅读
              </div>
              
              <div className="flex items-center text-red-500">
                <HeartFilled className="mr-1" /> 
                {likes} 喜欢
              </div>
              
              {article.category && (
                <Tag className={`${dark ? 'bg-gray-800 text-blue-300 border-gray-700' : 'bg-blue-50 text-blue-600 border-blue-200'} rounded-full px-3 py-0.5`}>
                  {article.category}
                </Tag>
              )}
            </div>
          </div>
          
          <div className={`mx-6 h-px ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          
          {/* 作者信息 */}
          <div className={`mx-6 my-6 p-4 rounded-xl ${dark ? 'bg-gray-800/50' : 'bg-gray-50/70'} flex items-center`}>
            <Avatar
              src={profile.avatar ? getImageUrl(profile.avatar) : undefined}
              icon={!profile.avatar && <UserOutlined />}
              size={64}
              className={`${dark ? 'bg-gray-700 border-gray-600' : 'bg-blue-100 border-blue-200'} border-2`}
            />
            <div className="ml-4">
              <div className={`text-lg font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>
                {profile.nickname || '作者'}
              </div>
              <div className={`${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                {profile.bio || '这个人很懒，还没有填写个人简介'}
              </div>
            </div>
          </div>
          
          {/* 正文内容 */}
          <div
            className={`px-6 py-6 ${dark ? 'text-gray-300' : 'text-gray-800'} prose prose-lg max-w-none`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          
          {/* 文章底部操作 */}
          <div className="px-6 pb-8 flex justify-center space-x-6">
            <Tooltip title="喜欢这篇文章">
              <button
                className={`flex items-center space-x-2 px-6 py-2 rounded-full ${dark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-red-50 hover:bg-red-100'} text-red-500 transition-all duration-300 focus:outline-none`}
                onClick={handleLike}
              >
                <HeartFilled className={`text-xl ${likeAnim ? 'animate-ping' : ''}`} />
                <span>{likes}</span>
              </button>
            </Tooltip>
            
            <Tooltip title="分享文章">
              <button 
                className={`flex items-center space-x-2 px-6 py-2 rounded-full ${dark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-blue-50 hover:bg-blue-100'} ${dark ? 'text-blue-400' : 'text-blue-600'} transition-all duration-300 focus:outline-none`}
                onClick={handleShare}
              >
                <ShareAltOutlined className="text-xl" />
                <span>分享</span>
              </button>
            </Tooltip>
          </div>
        </article>
      </main>
      
      {/* 页脚 */}
      <footer className={`py-6 ${dark ? 'dark-glass-effect border-t border-gray-800' : 'glass-effect border-t border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            © {new Date().getFullYear()} 个人博客系统 | 使用React和Ant Design构建
          </p>
        </div>
      </footer>
    </div>
  );
}
