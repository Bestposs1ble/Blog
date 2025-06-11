const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const router = express.Router();

// 允许的图片类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

// 设置上传目录和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
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
  if (!req.file) {
    return res.status(400).json({ code: 1, msg: '上传失败，只允许图片类型，且大小不超过2MB' });
  }
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
