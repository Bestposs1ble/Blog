import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import instance from '../api';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = values => {
    setLoading(true);
    instance.post('/user/login', values).then(res => {
      setLoading(false);
      if (res.data.code === 0) {
        localStorage.setItem('token', res.data.token);
        message.success('登录成功');
        navigate('/admin');
      } else {
        message.error(res.data.msg);
      }
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8"
         style={{ 
           backgroundImage: 'url(https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80)',
           backgroundAttachment: 'fixed'
         }}>
      
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30"></div>
      
      {/* 登录卡片 */}
      <div className="glass-effect relative w-full max-w-md p-8 rounded-2xl shadow-xl z-10 overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full opacity-20 mix-blend-multiply filter blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 mix-blend-multiply filter blur-xl"></div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">博客后台管理</h2>
          <p className="text-gray-600">请登录以继续</p>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          className="space-y-6"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
            className="mb-4"
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="用户名" 
              className="rounded-lg py-2 px-4 border-gray-300 hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            className="mb-6"
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码" 
              className="rounded-lg py-2 px-4 border-gray-300 hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>
          
          <Form.Item className="mb-0">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              className="h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              登录
            </Button>
          </Form.Item>
          
          <div className="text-center mt-4">
            <a href="/" className="text-blue-500 hover:text-blue-700 transition-colors duration-300">
              返回首页
            </a>
          </div>
        </Form>
      </div>
    </div>
  );
}
