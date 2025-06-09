const db = require('../config/db');

// 获取个人信息
exports.get = async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM profile LIMIT 1');
  res.json({ code: 0, data: rows[0] || {} });
};

// 修改个人信息
exports.update = async (req, res) => {
  const { avatar, nickname, bio, email } = req.body;
  // 如果没有记录则插入，有则更新
  const [rows] = await db.execute('SELECT * FROM profile LIMIT 1');
  if (rows.length === 0) {
    await db.execute('INSERT INTO profile (avatar, nickname, bio, email) VALUES (?, ?, ?, ?)', [avatar, nickname, bio, email]);
  } else {
    await db.execute('UPDATE profile SET avatar=?, nickname=?, bio=?, email=? WHERE id=?', [avatar, nickname, bio, email, rows[0].id]);
  }
  res.json({ code: 0, msg: '修改成功' });
};