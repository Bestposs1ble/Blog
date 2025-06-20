const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const router = express.Router();

// 允许的图片类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('已创建上传目录:', uploadDir);
}

// 设置上传目录和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 文件名加随机串
    const ext = path.extname(file.originalname);
    const randomStr = crypto.randomBytes(6).toString('hex');
    cb(null, Date.now() + '_' + randomStr + ext);
  }
});

// 文件类型和大小校验
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: function (req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片类型文件！'));
    }
  }
});

// 上传接口
router.post('/', upload.single('file'), (req, res) => {
  console.log('收到上传请求');
  if (!req.file) {
    console.log('没有文件');
    return res.status(400).json({ code: 1, msg: '上传失败，只允许图片类型，且大小不超过2MB' });
  }
  console.log('文件已保存:', req.file.path);
  const url = `/uploads/${req.file.filename}`;
  res.json({ code: 0, url });
});

// 错误处理
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ code: 1, msg: '文件过大，最大2MB' });
  } else if (err) {
    res.status(400).json({ code: 1, msg: err.message });
  } else {
    next();
  }
});

module.exports = router;
