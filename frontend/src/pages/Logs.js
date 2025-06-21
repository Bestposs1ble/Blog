import React, { useState, useEffect } from 'react';
import { Table, Card, Statistic, DatePicker, Button, message } from 'antd';
import { UserOutlined, EyeOutlined, GlobalOutlined, LineChartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import instance from '../api';

const { RangePicker } = DatePicker;

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    today: 0,
    total: 0,
    uniqueIPs: 0,
    weeklyStats: [],
    topPages: []
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [dateRange, setDateRange] = useState(null);
  const [dark, setDark] = useState(() => {
    // 从 localStorage 读取暗色模式设置
    return localStorage.getItem('darkMode') === 'true';
  });
  
  const navigate = useNavigate();

  // 权限校验
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      message.warning('请先登录');
      navigate('/login');
    }
  }, [navigate]);
  
  // 获取访客日志
  const fetchLogs = (page = 1, pageSize = 10) => {
    setLoading(true);
    
    let url = `/log?page=${page}&pageSize=${pageSize}`;
    if (dateRange && dateRange[0] && dateRange[1]) {
      url += `&startDate=${dateRange[0].format('YYYY-MM-DD')}&endDate=${dateRange[1].format('YYYY-MM-DD')}`;
    }
    
    instance.get(url).then(res => {
      setLoading(false);
      if (res.data.code === 0) {
        setLogs(res.data.data.list || []);
        setPagination({
          current: page,
          pageSize,
          total: res.data.data.pagination.total
        });
      } else {
        message.error('获取访客日志失败');
      }
    }).catch(() => {
      setLoading(false);
      message.error('获取访客日志失败');
    });
  };
  
  // 获取统计数据
  const fetchStats = () => {
    instance.get('/log/stats').then(res => {
      if (res.data.code === 0) {
        setStats(res.data.data || {
          today: 0,
          total: 0,
          uniqueIPs: 0,
          weeklyStats: [],
          topPages: []
        });
      }
    });
  };
  
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);
  
  // 表格分页变化
  const handleTableChange = (pagination) => {
    fetchLogs(pagination.current, pagination.pageSize);
  };
  
  // 日期范围变化
  const handleDateChange = (dates) => {
    setDateRange(dates);
  };
  
  // 应用日期筛选
  const applyDateFilter = () => {
    fetchLogs(1, pagination.pageSize);
  };
  
  // 重置日期筛选
  const resetDateFilter = () => {
    setDateRange(null);
    fetchLogs(1, pagination.pageSize);
  };
  
  // 格式化路径显示
  const formatPath = (path) => {
    if (path === '/') return '首页';
    if (path.startsWith('/api/article/')) return '文章详情';
    if (path === '/api/article') return '文章列表';
    if (path === '/api/user/login') return '登录接口';
    return path;
  };
  
  // 表格列定义
  const columns = [
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '访问路径',
      dataIndex: 'path',
      key: 'path',
      render: (text) => formatPath(text)
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
    },
    {
      title: '用户代理',
      dataIndex: 'user_agent',
      key: 'user_agent',
      ellipsis: true,
    },
    {
      title: '访问时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString()
    }
  ];
  
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button 
            type="primary"
            onClick={() => navigate('/')} 
            className={`rounded-full flex items-center ${dark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} border-0 shadow-md hover:shadow-lg transition-all duration-300`}
            icon={<ArrowLeftOutlined />}
          >
            返回首页
          </Button>
        </div>
        
        <h1 className={`text-3xl font-bold mb-8 ${dark ? 'text-white' : 'text-gray-800'}`}>访客统计</h1>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${dark ? 'dark-glass-effect' : 'glass-effect'} rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dark ? 'bg-blue-900/50' : 'bg-blue-100'} mr-4`}>
                <EyeOutlined className={`text-xl ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>今日访问量</p>
                <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{stats.today}</p>
              </div>
            </div>
          </div>
          
          <div className={`${dark ? 'dark-glass-effect' : 'glass-effect'} rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dark ? 'bg-green-900/50' : 'bg-green-100'} mr-4`}>
                <LineChartOutlined className={`text-xl ${dark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div>
                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>总访问量</p>
                <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className={`${dark ? 'dark-glass-effect' : 'glass-effect'} rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dark ? 'bg-purple-900/50' : 'bg-purple-100'} mr-4`}>
                <GlobalOutlined className={`text-xl ${dark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>独立IP数</p>
                <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{stats.uniqueIPs}</p>
              </div>
            </div>
          </div>
          
          <div className={`${dark ? 'dark-glass-effect' : 'glass-effect'} rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dark ? 'bg-amber-900/50' : 'bg-amber-100'} mr-4`}>
                <UserOutlined className={`text-xl ${dark ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
              <div>
                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>人均访问次数</p>
                <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>
                  {stats.uniqueIPs ? (stats.total / stats.uniqueIPs).toFixed(2) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 页面访问排行 */}
        <div className={`${dark ? 'dark-glass-effect' : 'glass-effect'} rounded-xl overflow-hidden shadow-lg mb-8`}>
          <div className={`px-6 py-4 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>页面访问排行</h2>
          </div>
          <div className="p-6">
            <Table 
              dataSource={stats.topPages} 
              rowKey="path"
              pagination={false}
              columns={[
                {
                  title: '页面路径',
                  dataIndex: 'path',
                  key: 'path',
                  render: (text) => formatPath(text)
                },
                {
                  title: '访问次数',
                  dataIndex: 'count',
                  key: 'count',
                  sorter: (a, b) => a.count - b.count,
                  defaultSortOrder: 'descend'
                }
              ]}
              className={dark ? 'dark-theme-table' : ''}
            />
          </div>
        </div>
        
        {/* 访客日志列表 */}
        <div className={`${dark ? 'dark-glass-effect' : 'glass-effect'} rounded-xl overflow-hidden shadow-lg`}>
          <div className={`px-6 py-4 border-b ${dark ? 'border-gray-700' : 'border-gray-200'} flex flex-wrap justify-between items-center`}>
            <h2 className={`text-xl font-semibold ${dark ? 'text-white' : 'text-gray-800'} mb-2 md:mb-0`}>访客日志</h2>
            <div className="flex flex-wrap items-center gap-2">
              <RangePicker 
                value={dateRange}
                onChange={handleDateChange}
                className={dark ? 'dark-theme-datepicker' : ''}
              />
              <Button 
                type="primary" 
                onClick={applyDateFilter}
                className={`${dark ? 'bg-blue-600 hover:bg-blue-700 border-blue-700' : 'bg-blue-500 hover:bg-blue-600 border-blue-500'} ml-2`}
              >
                应用筛选
              </Button>
              <Button 
                onClick={resetDateFilter}
                className={dark ? 'dark-theme-button' : ''}
              >
                重置
              </Button>
            </div>
          </div>
          <div className="p-6">
            <Table 
              dataSource={logs} 
              columns={columns} 
              rowKey="id"
              pagination={pagination}
              loading={loading}
              onChange={handleTableChange}
              className={dark ? 'dark-theme-table' : ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 