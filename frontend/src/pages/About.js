import React, { useEffect, useState } from 'react';
import { Card, Avatar, Divider, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import instance from '../api';

export default function About() {
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    instance.get('/api/profile').then(res => setProfile(res.data.data || {}));
  }, []);

  // 获取API基础URL
  const apiBaseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://bestpossible.space';
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${apiBaseUrl}${path}`;
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24 }}>
      <Button type="primary" onClick={() => navigate('/')} style={{ marginBottom: 24 }}>
        返回主页
      </Button>
      <Card
        style={{ borderRadius: 16, boxShadow: '0 2px 12px #f0f1f2', textAlign: 'center' }}
        cover={
          profile.avatar &&
          <Avatar
            src={getImageUrl(profile.avatar)}
            size={100}
            style={{ margin: '32px auto 0', display: 'block', border: '2px solid #eee' }}
          />
        }
      >
        <h2 style={{ fontWeight: 700, fontSize: 28 }}>{profile.nickname || '未设置昵称'}</h2>
        <div style={{ color: '#888', marginBottom: 16 }}>{profile.bio}</div>
        <Divider />
        <div style={{ fontSize: 16, marginBottom: 8 }}>
          <b>邮箱：</b>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </div>
        {/* 你可以加更多联系方式 */}
        <div style={{ margin: '16px 0' }}>
          
        </div>
        <Divider />
        <div>
          
          {/* 你可以加更多社交图标 */}
        </div>
        <p>
          GitHub：
          <a href="https://github.com/Bestposs1ble" target="_blank" rel="noopener noreferrer">
            @Bestposs1ble
          </a>
        </p>
      </Card>
    </div>
  );
}