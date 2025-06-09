import React, { useEffect, useState } from 'react';
import { Card, Avatar, Divider } from 'antd';
import instance from '../api';

export default function About() {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    instance.get('/profile').then(res => setProfile(res.data.data || {}));
  }, []);

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24 }}>
      <Card
        style={{ borderRadius: 16, boxShadow: '0 2px 12px #f0f1f2', textAlign: 'center' }}
        cover={
          profile.avatar &&
          <Avatar
            src={`http://localhost:3001${profile.avatar}`}
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
          <b>微信/QQ：</b>
          <img src="/your-qr-code.png" alt="二维码" width={120} style={{ display: 'block', margin: '12px auto' }} />
        </div>
        <Divider />
        <div>
          <b>社交：</b>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
            <Avatar src="/github-icon.png" size={32} />
          </a>
          {/* 你可以加更多社交图标 */}
        </div>
      </Card>
    </div>
  );
}