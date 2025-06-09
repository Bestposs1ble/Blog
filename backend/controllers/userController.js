const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = 'your_jwt_secret'; // 建议放到 .env 文件

exports.register = async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
    res.json({ code: 0, msg: '注册成功' });
  } catch (err) {
    res.json({ code: 1, msg: '注册失败', error: err });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length === 0) return res.json({ code: 1, msg: '用户不存在' });
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ code: 1, msg: '密码错误' });
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '2h' });
  res.json({ code: 0, msg: '登录成功', token });
};
