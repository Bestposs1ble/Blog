import React, { useEffect, useState } from 'react';
import { Layout, Menu, Card, List, Avatar, Tag, Select, Switch, message, Radio, Dropdown, Pagination } from 'antd';
import { MoonOutlined, SunOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import instance from '../api';
import '../styles/DarkMode.css';

const { Header, Content, Footer } = Layout;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0, 5);
}

function ArticleCard({ item, dark }) {
  return (
    <Card
      hoverable
      style={{
        borderRadius: 14,
        boxShadow: dark ? '0 4px 24px rgba(0, 0, 0, 0.5)' : '0 4px 24px #f0f1f2',
        marginBottom: 24,
        transition: 'all 0.3s',
        cursor: 'pointer',
        overflow: 'hidden',
        backgroundColor: dark ? '#1e1e1e' : '#fff',
        border: dark ? '1px solid #303030' : '1px solid #f0f0f0'
      }}
      bodyStyle={{ padding: 24 }}
      cover={
        item.cover &&
        <img
          alt="cover"
          src={`http://localhost:3001${item.cover}`}
          style={{ maxHeight: 220, objectFit: 'cover', width: '100%' }}
        />
      }
      onClick={() => window.location.href = `/article/${item.id}`}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: dark ? '#4a9eff' : '#1677ff',
          cursor: 'pointer',
          transition: 'color 0.2s'
        }}
        onMouseOver={e => (e.currentTarget.style.color = dark ? '#69b1ff' : '#49c5b6')}
        onMouseOut={e => (e.currentTarget.style.color = dark ? '#4a9eff' : '#1677ff')}
      >
        {item.title}
      </div>
      <div style={{
        color: dark ? '#a8a8a8' : '#888',
        fontSize: 15,
        lineHeight: 1.7,
        marginTop: 6,
        maxHeight: 44,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>
        {item.content}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        color: dark ? '#a8a8a8' : '#888',
        fontSize: 14
      }}>
        <div>
          {item.category && (
            <Tag 
              color={dark ? undefined : "blue"}
              style={dark ? {
                backgroundColor: '#2d2d2d',
                borderColor: '#404040',
                color: '#e4e4e4'
              } : undefined}
            >
              {item.category}
            </Tag>
          )}
        </div>
        <div>
          {formatDate(item.created_at)} | 阅读量：{item.views || 0}
        </div>
      </div>
    </Card>
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
    instance.get('/profile').then(res => setProfile(res.data.data || {}));
    instance.get('/article').then(res => setArticles(res.data.data || []));
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
        <>
          <Menu.Item key="admin" onClick={() => navigate('/admin')}>管理后台</Menu.Item>
          <Menu.Item key="logout" onClick={() => {
            localStorage.removeItem('token');
            message.success('已退出登录');
            navigate('/');
          }}>退出登录</Menu.Item>
        </>
      )}
      {!localStorage.getItem('token') && (
        <Menu.Item key="login" onClick={() => navigate('/login')}>登录管理系统</Menu.Item>
      )}
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: dark ? '#121212' : '#f7f8fa' }}>
      <Header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        background: dark ? '#1e1e1e' : '#fff',
        borderBottom: '1px solid #f0f0f0',
        transition: 'all 0.3s'
      }}>
        <div style={{ flex: 1 }}>
          <Menu
            mode="horizontal"
            selectedKeys={[window.location.pathname]}
            style={{ background: 'transparent', border: 'none' }}
          >
            <Menu.Item key="/"><Link to="/">首页</Link></Menu.Item>
            <Menu.Item key="/about"><Link to="/about">关于</Link></Menu.Item>
          </Menu>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Switch
            checked={dark}
            onChange={setDark}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            style={{
              backgroundColor: dark ? '#177ddc' : '#f0f0f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          />
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={profile.avatar ? `http://localhost:3001${profile.avatar}` : undefined}
                icon={!profile.avatar && <UserOutlined />}
                style={{ marginRight: 8 }}
              />
              <span style={{ color: dark ? '#e4e4e4' : 'inherit' }}>{profile.nickname || '未登录'}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Content style={{ 
        maxWidth: 900, 
        margin: '0 auto', 
        padding: '32px 8px 0 8px', 
        minHeight: '80vh',
        backgroundColor: 'transparent'
      }}>
        {/* 分类筛选 */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
          <Radio.Group
            value={tab}
            onChange={e => {
              setTab(e.target.value);
              setCurrentPage(1); // 切换tab时重置页码
            }}
            style={{ marginLeft: 8 }}
            buttonStyle="solid"
          >
            <Radio.Button value="latest">最新博客</Radio.Button>
            <Radio.Button value="hot">热门博客</Radio.Button>
          </Radio.Group>
        </div>
        <List
          grid={{ gutter: 24, column: 1 }}
          dataSource={currentArticles}
          renderItem={item => <ArticleCard item={item} dark={dark} />}
        />
        {/* 分页器 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: 32,
          marginBottom: 32,
          backgroundColor: 'transparent'
        }}>
          <Pagination
            current={currentPage}
            total={showArticles.filter(a => !category || a.category === category).length}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </Content>
      <Footer style={{ 
        textAlign: 'center', 
        backgroundColor: dark ? '#1e1e1e' : '#fff',
        color: dark ? '#888' : 'inherit',
        borderTop: dark ? '1px solid #303030' : '1px solid #f0f0f0'
      }}>
        © {new Date().getFullYear()} 何雨晨 | Powered by React & Ant Design
      </Footer>
    </Layout>
  );
}