import React, { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Statistic, DatePicker, Button, message } from 'antd';
import { UserOutlined, EyeOutlined, GlobalOutlined, LineChartOutlined } from '@ant-design/icons';
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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>访客统计</h2>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日访问量"
              value={stats.today}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总访问量"
              value={stats.total}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="独立IP数"
              value={stats.uniqueIPs}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="人均访问次数"
              value={stats.uniqueIPs ? (stats.total / stats.uniqueIPs).toFixed(2) : 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      {/* 页面访问排行 */}
      <Card title="页面访问排行" style={{ marginBottom: 24 }}>
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
        />
      </Card>
      
      {/* 访客日志列表 */}
      <Card 
        title="访客日志" 
        extra={
          <div>
            <RangePicker 
              value={dateRange}
              onChange={handleDateChange}
              style={{ marginRight: 8 }}
            />
            <Button type="primary" onClick={applyDateFilter} style={{ marginRight: 8 }}>
              应用筛选
            </Button>
            <Button onClick={resetDateFilter}>
              重置
            </Button>
          </div>
        }
      >
        <Table 
          dataSource={logs} 
          columns={columns} 
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
} 