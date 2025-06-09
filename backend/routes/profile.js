const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// 获取个人信息
router.get('/', profileController.get);
// 修改个人信息（需登录）
router.put('/', auth, profileController.update);

module.exports = router;