import React, { useEffect, useState } from 'react';
import { Layout, Button, Tag, Avatar } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import instance from '../api';
import '../styles/ArticleDetail.css';

const { Content, Footer } = Layout;

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    instance.get(`/article/${id}`).then(res => {
      if (res.data.code === 0) setArticle(res.data.data);
      else navigate('/404');
    });
    instance.get('/profile').then(res => setProfile(res.data.data || {}));
  }, [id, navigate]);

  if (!article) return null;

  return (
    <Layout style={{ background: '#f7f8fa', minHeight: '100vh' }}>
      <Content style={{ padding: 0, margin: 0 }}>
        <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 0 24px' }}>
            <Button 
              type="primary"
              onClick={() => navigate('/')} 
              style={{ 
                marginBottom: 24, 
                fontSize: 16,
                height: 'auto',
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '20px',
                background: '#1677ff',
                boxShadow: '0 2px 8px rgba(22, 119, 255, 0.2)',
                transition: 'all 0.3s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              
              返回首页
            </Button>
            {/* 封面图 */}
            {article.cover && (
              <img
                alt="cover"
                src={`http://localhost:3001${article.cover}`}
                style={{
                  width: '100%',
                  maxHeight: 420,
                  objectFit: 'cover',
                  borderRadius: 12,
                  marginBottom: 32
                }}
              />
            )}
            {/* 标题和元信息 */}
            <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 8 }}>
              <h1 style={{ fontSize: 38, fontWeight: 800, margin: 0, flex: 1, lineHeight: 1.2 }}>
                {article.title}
              </h1>
              {article.category && <Tag color="blue" style={{ marginLeft: 16, fontSize: 16 }}>{article.category}</Tag>}
            </div>
            {/* 发布时间 */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              color: '#888',
              fontSize: 15,
              marginBottom: 32
            }}>
              {new Date(article.created_at).toLocaleString()}
            </div>
            {/* 作者信息 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
              <Avatar
                src={profile.avatar ? `http://localhost:3001${profile.avatar}` : undefined}
                size={48}
                style={{ marginRight: 14, border: '1px solid #eee' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{profile.nickname || '作者'}</div>
                <div style={{ color: '#aaa', fontSize: 14 }}>{profile.bio}</div>
              </div>
            </div>
            {/* 正文内容 */}
            <div
              style={{
                fontSize: 20,
                lineHeight: 2,
                color: '#222',
                marginTop: 8,
                minHeight: 200,
                wordBreak: 'break-word'
              }}
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', color: '#888', background: '#fafafa', letterSpacing: 1, marginTop: 32 }}>
        © {new Date().getFullYear()} 何雨晨 | Powered by React & Ant Design
      </Footer>
    </Layout>
  );
}
