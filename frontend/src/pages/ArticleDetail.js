import React, { useEffect, useState } from 'react';
import { Layout, Button, Tag, Avatar, message, Tooltip, Divider, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartFilled, CalendarOutlined, EyeOutlined, ArrowLeftOutlined, ShareAltOutlined } from '@ant-design/icons';
import instance from '../api';
import '../styles/ArticleDetail.css';

const { Content, Footer } = Layout;

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [profile, setProfile] = useState({});
  const [likes, setLikes] = useState(0);
  const [likeAnim, setLikeAnim] = useState(false);
  
  // 获取API基础URL
  const apiBaseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://bestpossible.space';

  useEffect(() => {
    // 获取文章详情
    instance.get(`/api/article/${id}`).then(res => {
      if (res.data.code === 0) {
        setArticle(res.data.data || {});
        setLikes(res.data.data.likes || 0);
      } else {
        message.error('获取文章失败');
        navigate('/');
      }
    });
    
    // 获取个人信息
    instance.get('/api/profile').then(res => setProfile(res.data.data || {}));
  }, [id, navigate]);

  const handleLike = () => {
    setLikeAnim(true);
    setLikes(likes + 1); // 本地立即+1
    instance.post(`/api/article/${id}/like`).then(res => {
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
    return `${apiBaseUrl}${path}`;
  };

  // 格式化日期
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('zh-CN', options);
  };

  if (!article) return null;

  return (
    <Layout className="article-detail-layout">
      <Content>
        <div className="article-container">
          {/* 返回按钮 */}
          <Button 
            type="primary"
            onClick={() => navigate('/')} 
            className="back-button"
            icon={<ArrowLeftOutlined />}
          >
            返回首页
          </Button>
          
          {/* 封面图 */}
          {article.cover && (
            <div className="cover-image-container">
              <img
                alt="cover"
                src={getImageUrl(article.cover)}
                className="cover-image"
              />
            </div>
          )}
          
          {/* 文章头部 */}
          <div className="article-header">
            <h1 className="article-title">{article.title}</h1>
            
            {/* 文章元信息 */}
            <div className="article-meta">
              <Space size={16} wrap>
                <div className="meta-item">
                  <CalendarOutlined /> {formatDate(article.created_at)}
                </div>
                <div className="meta-item">
                  <EyeOutlined /> {article.views || 0} 阅读
                </div>
                <div className="meta-item">
                  <HeartFilled style={{ color: '#ff4d4f' }} /> {likes} 喜欢
                </div>
                {article.category && (
                  <Tag color="blue" className="category-tag">{article.category}</Tag>
                )}
              </Space>
            </div>
          </div>
          
          <Divider className="article-divider" />
          
          {/* 作者信息 */}
          <div className="author-card">
            <Avatar
              src={profile.avatar ? getImageUrl(profile.avatar) : undefined}
              size={64}
              className="author-avatar"
            />
            <div className="author-info">
              <div className="author-name">{profile.nickname || '作者'}</div>
              <div className="author-bio">{profile.bio}</div>
            </div>
          </div>
          
          {/* 正文内容 */}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          
          {/* 文章底部操作 */}
          <div className="article-actions">
            <Tooltip title="喜欢这篇文章">
              <button
                className={`like-button ${likeAnim ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <HeartFilled />
                <span>{likes}</span>
                <span className="like-effect" />
              </button>
            </Tooltip>
            
            <Tooltip title="分享文章">
              <button className="share-button" onClick={handleShare}>
                <ShareAltOutlined />
                <span>分享</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </Content>
      <Footer className="article-footer">
        © {new Date().getFullYear()} 何雨晨 | Powered by React & Ant Design
      </Footer>
    </Layout>
  );
}
