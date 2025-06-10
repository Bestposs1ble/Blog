const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const auth = require('../middleware/auth');

// 获取所有文章
router.get('/', articleController.getAll);
// 获取单篇文章
router.get('/:id', articleController.getById);
// 新增文章（需登录）
router.post('/', auth, articleController.create);
// 修改文章（需登录）
router.put('/:id', auth, articleController.update);
// 删除文章（需登录）
router.delete('/:id', auth, articleController.remove);

// 点赞接口（游客可无限点赞）
router.post('/:id/like', articleController.like);

module.exports = router;