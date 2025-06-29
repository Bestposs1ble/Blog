const db = require('../config/db');

module.exports = async (req, res, next) => {
  // 只记录博客页面和后端登录接口
  const isBlogVisit = req.path === '/' || req.path.startsWith('/api/article') || req.path.startsWith('/api/blog');
  const isLoginVisit = req.path === '/api/user/login';
  if (isBlogVisit || isLoginVisit) {
    // 优先获取真实IP
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    if (ip && ip.includes(',')) {
      ip = ip.split(',')[0].trim(); // 取第一个IP
    }
    // 兼容IPv6 ::ffff:127.0.0.1
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    const path = req.originalUrl;
    const method = req.method;
    const userAgent = req.headers['user-agent'] || '';
    const now = new Date();
    db.execute(
      'INSERT INTO access_logs (ip, path, method, user_agent, created_at) VALUES (?, ?, ?, ?, ?)',
      [ip, path, method, userAgent, now]
    ).catch(err => {
      console.error('日志记录失败', err);
    });
  }
  next();
};
