const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// 设置上传目录和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    // 保证文件名唯一
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

// 上传接口
router.post('/', upload.single('file'), (req, res) => {
  const url = `/uploads/${req.file.filename}`;
  res.json({ code: 0, url });
});

module.exports = router;
