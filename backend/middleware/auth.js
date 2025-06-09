const jwt = require('jsonwebtoken');
const SECRET = 'your_jwt_secret'; // 建议放到 .env 文件

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ code: 401, msg: '未登录' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ code: 401, msg: 'token无效' });
  }
};