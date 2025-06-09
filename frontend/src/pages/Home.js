import React, { useEffect, useState } from 'react';
import { Layout, Menu, Card, List, Avatar, Tag, Select, Switch, message, Radio } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import instance from '../api';

const { Header, Content, Footer } = Layout;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0, 5);
}

function ArticleCard({ item }) {
  return (
    <Card
      hoverable
      style={{
        borderRadius: 14,
        boxShadow: '0 4px 24px #f0f1f2',
        marginBottom: 24,
        transition: 'box-shadow 0.3s',
        cursor: 'pointer',
        overflow: 'hidden'
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
          color: '#1677ff',
          cursor: 'pointer',
          transition: 'color 0.2s'
        }}
        onMouseOver={e => (e.currentTarget.style.color = '#49c5b6')}
        onMouseOut={e => (e.currentTarget.style.color = '#1677ff')}
      >
        {item.title}
      </div>
      <div style={{
        color: '#888',
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
        color: '#888',
        fontSize: 14
      }}>
        <div>
          {item.category && <Tag color="blue">{item.category}</Tag>}
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
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState('latest');

  useEffect(() => {
    instance.get('/profile').then(res => setProfile(res.data.data || {}));
    instance.get('/article').then(res => setArticles(res.data.data || []));
  }, []);



  // 最新/热门文章
  const latestArticles = [...articles].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const hotArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));
  const showArticles = tab === 'latest' ? latestArticles : hotArticles;

  // 夜间模式切换
  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    return () => document.body.classList.remove('dark-theme');
  }, [dark]);

  return (
    <Layout className={dark ? 'dark-theme' : ''}>
      {/* 顶部渐变Banner */}
      
      <Header style={{
        background: '#fff',
        borderBottom: '1px solid #eee',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: 22, color: '#1677ff', flex: 1, letterSpacing: 2 }}>
          欢迎来到我的博客
        </div>
        <Menu mode="horizontal" style={{ border: 'none', flex: 1, justifyContent: 'flex-end' }} selectable={false}>
          <Menu.Item key="home" onClick={() => window.location.href = '/'}>首页</Menu.Item>
          <Menu.Item key="about" onClick={() => window.location.href = '/about'}>关于</Menu.Item>
        </Menu>
        {/* 右上角简略个人信息 */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 24 }}>
          <Avatar
            src={profile.avatar ? `http://localhost:3001${profile.avatar}` : undefined}
            size={36}
            style={{ marginRight: 8, cursor: 'pointer' }}
            onClick={() => window.location.href = '/about'}
          />
          <span style={{ fontWeight: 500, fontSize: 16, cursor: 'pointer' }} onClick={() => window.location.href = '/about'}>
            {profile.nickname || '未登录'}
          </span>
          <Switch
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            checked={dark}
            onChange={setDark}
            style={{ marginLeft: 16 }}
          />
        </div>
      </Header>
      <Content style={{ maxWidth: 900, margin: '0 auto', padding: '32px 8px 0 8px', minHeight: '80vh' }}>
        {/* 分类筛选 */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
          
          <Radio.Group
            value={tab}
            onChange={e => setTab(e.target.value)}
            style={{ marginLeft: 8 }}
            buttonStyle="solid"
          >
            <Radio.Button value="latest">最新博客</Radio.Button>
            <Radio.Button value="hot">热门博客</Radio.Button>
          </Radio.Group>
        </div>
        <List
          grid={{ gutter: 24, column: 1 }}
          dataSource={showArticles.filter(a => !category || a.category === category)}
          renderItem={item => <ArticleCard item={item} />}
        />
      </Content>
      <Footer style={{ textAlign: 'center', color: '#888', background: '#fafafa', letterSpacing: 1 }}>
        © {new Date().getFullYear()} 何雨晨 | Powered by React & Ant Design
      </Footer>
    </Layout>
  );
}