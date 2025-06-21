import React, { useEffect, useState } from 'react';
import { Menu, Tag, Switch, message, Radio, Dropdown, Pagination, Avatar } from 'antd';
import { MoonOutlined, SunOutlined, UserOutlined, EyeOutlined, HeartFilled, ClockCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import instance from '../api';
import '../styles/LikeButton.css';

// 获取API基础URL
const apiBaseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://bestpossible.space';

// 处理图片URL
const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) return path;
  return `/uploads/${path.replace(/^\/+/, '')}`;
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0, 5);
}

function ArticleCard({ item, dark }) {
  const [likes, setLikes] = React.useState(item.likes || 0);
  const [likeAnim, setLikeAnim] = React.useState(false);
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);
  
  const handleLike = (e) => {
    e.stopPropagation(); // 防止点击卡片跳转
    setLikeAnim(true);
    setIsClicked(true);
    setLikes(likes + 1);
    instance.post(`/article/${item.id}/like`).then(res => {
      if (res.data.code === 0) setLikes(res.data.likes);
    });
    setTimeout(() => setLikeAnim(false), 500);
    setTimeout(() => setIsClicked(false), 600);
  };

  return (
    <div 
      className={`${dark ? 'dark-glass-effect' : 'glass-effect'} rounded-xl overflow-hidden mb-6 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
      onClick={() => navigate(`/article/${item.id}`)}
    >
      {item.cover && (
        <div 
          className="w-full h-52 bg-cover bg-center transform hover:scale-105 transition-all duration-700"
          style={{ backgroundImage: `url(${getImageUrl(item.cover)})` }}
        />
      )}
      
      <div className="p-6">
        <h2 className={`text-xl font-bold mb-3 ${dark ? 'text-blue-400' : 'text-blue-600'} hover:text-blue-500 transition-colors duration-200`}>
          {item.title}
        </h2>
        
        <div 
          className={`${dark ? 'text-gray-300' : 'text-gray-600'} mb-4 line-clamp-2 text-sm leading-relaxed`}
          dangerouslySetInnerHTML={{ __html: item.content ? item.content.substring(0, 150) : '' }}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`flex items-center ${dark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
              <ClockCircleOutlined className="mr-1" />
              {formatDate(item.created_at).split(' ')[0]}
            </span>
            
            {item.category && (
              <Tag 
                className={`${dark ? 'bg-gray-800 text-blue-300 border-gray-700' : 'bg-blue-50 text-blue-600 border-blue-200'} rounded-full px-3 py-0.5 text-xs`}
              >
                {item.category}
              </Tag>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className={`flex items-center ${dark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
              <EyeOutlined className="mr-1" />
              {item.views || 0}
            </span>
            
            <button
              className={`like-btn${likeAnim ? ' liked' : ''}${isClicked ? ' clicked' : ''} flex items-center text-red-500 text-sm focus:outline-none`}
              onClick={handleLike}
            >
              <HeartFilled className="mr-1" />
              <span>{likes}</span>
              <span className="like-effect" />
              <span className="like-btn-ripple" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [profile, setProfile] = useState({});
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('');
  const [dark, setDark] = useState(() => {
    // 从 localStorage 读取暗色模式设置
    return localStorage.getItem('darkMode') === 'true';
  });
  const [tab, setTab] = useState('latest');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // 每页显示5篇文章

  useEffect(() => {
    // 获取个人信息和文章列表
    instance.get('/profile').then(res => setProfile(res.data.data || {}));
    instance.get('/article').then(res => setArticles(res.data.data || [])); // 保证原始数据
  }, []);

  // 最新/热门文章
  const latestArticles = [...articles].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const hotArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));
  const showArticles = tab === 'latest' ? latestArticles : hotArticles;
  
  // 根据当前页码筛选文章
  const currentArticles = showArticles
    .filter(a => !category || a.category === category)
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 夜间模式切换
  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('darkMode', 'false');
    }
  }, [dark]);

  const userMenu = (
    <Menu>
      <Menu.Item key="about" onClick={() => navigate('/about')}>关于我</Menu.Item>
      {localStorage.getItem('token') && (
        <Menu.Item key="admin" onClick={() => navigate('/admin')}>管理后台</Menu.Item>
      )}
      {!localStorage.getItem('token') && (
        <Menu.Item key="login" onClick={() => navigate('/login')}>登录管理系统</Menu.Item>
      )}
    </Menu>
  );

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
      
      {/* 导航栏 */}
      <header className={`sticky top-0 z-10 ${dark ? 'dark-glass-effect' : 'glass-effect'} backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex-1">
            <nav className="flex space-x-8">
              <Link to="/" className={`${dark ? 'text-white' : 'text-gray-900'} hover:text-blue-500 font-medium transition-colors duration-200`}>
                首页
              </Link>
              <Link to="/about" className={`${dark ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-500 font-medium transition-colors duration-200`}>
                关于我
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-6">
            <Switch
              checked={dark}
              onChange={setDark}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              className={`${dark ? 'bg-blue-600' : 'bg-gray-200'} shadow-md`}
            />
            
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div className="flex items-center cursor-pointer">
                <Avatar
                  src={profile.avatar ? getImageUrl(profile.avatar) : undefined}
                  icon={!profile.avatar && <UserOutlined />}
                  className={`${dark ? 'bg-gray-700' : 'bg-blue-100'} mr-2`}
                />
                <span className={dark ? 'text-white' : 'text-gray-800'}>
                  {profile.nickname || '未登录'}
                </span>
              </div>
            </Dropdown>
          </div>
        </div>
      </header>
      
      {/* 主体内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 博客标题区 */}
        <div className="mb-10 text-center">
          <h1 className={`text-4xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
            个人博客
          </h1>
          <p className={`text-lg ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            分享技术与生活的点滴
          </p>
        </div>
        
        {/* 分类筛选 */}
        <div className="mb-8 flex justify-center">
          <Radio.Group
            value={tab}
            onChange={e => {
              setTab(e.target.value);
              setCurrentPage(1); // 切换tab时重置页码
            }}
            buttonStyle="solid"
            className={`${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-1 shadow-md border`}
          >
            <Radio.Button value="latest" className={`${dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} rounded-md`}>
              最新博客
            </Radio.Button>
            <Radio.Button value="hot" className={`${dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} rounded-md`}>
              热门博客
            </Radio.Button>
          </Radio.Group>
        </div>
        
        {/* 文章列表 */}
        <div className="space-y-6">
          {currentArticles.map(item => (
            <ArticleCard key={item.id} item={item} dark={dark} />
          ))}
        </div>
        
        {/* 分页器 */}
        {showArticles.length > pageSize && (
          <div className="flex justify-center mt-10">
            <Pagination
              current={currentPage}
              total={showArticles.filter(a => !category || a.category === category).length}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              className={dark ? 'dark-theme-pagination' : ''}
            />
          </div>
        )}
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