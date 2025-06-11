const db = require('../config/db');

// 获取访客日志列表
exports.getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    
    let query = 'SELECT * FROM access_logs';
    let countQuery = 'SELECT COUNT(*) as total FROM access_logs';
    let params = [];
    let countParams = [];
    
    // 添加日期筛选条件
    if (startDate && endDate) {
      query += ' WHERE created_at BETWEEN ? AND ?';
      countQuery += ' WHERE created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
      countParams.push(startDate, endDate);
    } else if (startDate) {
      query += ' WHERE created_at >= ?';
      countQuery += ' WHERE created_at >= ?';
      params.push(startDate);
      countParams.push(startDate);
    } else if (endDate) {
      query += ' WHERE created_at <= ?';
      countQuery += ' WHERE created_at <= ?';
      params.push(endDate);
      countParams.push(endDate);
    }
    
    // 添加排序和分页
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, (page - 1) * pageSize);
    
    // 执行查询
    const [logs] = await db.execute(query, params);
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      code: 0,
      data: {
        list: logs,
        pagination: {
          current: page,
          pageSize,
          total
        }
      }
    });
  } catch (error) {
    console.error('获取访客日志失败:', error);
    res.json({ code: 1, msg: '获取访客日志失败' });
  }
};

// 获取访客统计数据
exports.getStats = async (req, res) => {
  try {
    // 获取今日访问量
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [todayResult] = await db.execute(
      'SELECT COUNT(*) as count FROM access_logs WHERE created_at >= ?',
      [todayStart]
    );
    
    // 获取过去7天的访问量
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const [weekResult] = await db.execute(
      'SELECT DATE(created_at) as date, COUNT(*) as count FROM access_logs WHERE created_at >= ? GROUP BY DATE(created_at) ORDER BY date',
      [weekStart]
    );
    
    // 获取访问页面排名
    const [pagesResult] = await db.execute(
      'SELECT path, COUNT(*) as count FROM access_logs GROUP BY path ORDER BY count DESC LIMIT 10'
    );
    
    // 获取总访问量
    const [totalResult] = await db.execute(
      'SELECT COUNT(*) as total FROM access_logs'
    );
    
    // 获取访问IP数
    const [ipResult] = await db.execute(
      'SELECT COUNT(DISTINCT ip) as count FROM access_logs'
    );
    
    res.json({
      code: 0,
      data: {
        today: todayResult[0].count,
        total: totalResult[0].total,
        uniqueIPs: ipResult[0].count,
        weeklyStats: weekResult,
        topPages: pagesResult
      }
    });
  } catch (error) {
    console.error('获取访客统计失败:', error);
    res.json({ code: 1, msg: '获取访客统计失败' });
  }
}; 