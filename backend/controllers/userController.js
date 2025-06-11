const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = 'your_jwt_secret'; // 建议放到 .env 文件
const loginAttempts = {}; // { ip: { count: 0, lastTime: 0 } }
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 10 * 60 * 1000; // 10分钟

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
  const ip = req.ip;
  const now = Date.now();

  // 检查是否被锁定
  if (loginAttempts[ip] && loginAttempts[ip].count >= MAX_ATTEMPTS) {
    if (now - loginAttempts[ip].lastTime < LOCK_TIME) {
      return res.json({ code: 1, msg: '登录失败次数过多，请10分钟后再试' });
    } else {
      // 解锁
      loginAttempts[ip] = { count: 0, lastTime: 0 };
    }
  }

  const { username, password } = req.body;
  const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length === 0) {
    // 记录失败
    loginAttempts[ip] = { count: (loginAttempts[ip]?.count || 0) + 1, lastTime: now };
    return res.json({ code: 1, msg: '用户不存在' });
  }
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    // 记录失败
    loginAttempts[ip] = { count: (loginAttempts[ip]?.count || 0) + 1, lastTime: now };
    return res.json({ code: 1, msg: '密码错误' });
  }

  // 登录成功，清除失败记录
  if (loginAttempts[ip]) delete loginAttempts[ip];

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '2h' });
  res.json({ code: 0, msg: '登录成功', token });
};
