const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const auth = require('../middleware/auth');

// 获取访客日志列表（需要登录权限）
router.get('/', auth, logController.getLogs);

// 获取访客统计数据（需要登录权限）
router.get('/stats', auth, logController.getStats);

module.exports = router; 