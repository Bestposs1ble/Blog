const db = require('../config/db');

// 获取所有文章
exports.getAll = async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM articles ORDER BY created_at DESC');
  res.json({ code: 0, data: rows });
};

// 获取单篇文章
exports.getById = async (req, res) => {
  const { id } = req.params;
  // 先自增阅读量
  await db.execute('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);
  const [rows] = await db.execute('SELECT * FROM articles WHERE id = ?', [id]);
  if (rows.length === 0) return res.json({ code: 1, msg: '文章不存在' });
  res.json({ code: 0, data: rows[0] });
};

// 新增文章
exports.create = async (req, res) => {
  const { title, content } = req.body;
  // cover 可能为 undefined/null/空字符串
  let cover = req.body.cover;
  if (!cover) cover = null;
  await db.execute(
    'INSERT INTO articles (title, content, cover) VALUES (?, ?, ?)',
    [title, content, cover]
  );
  res.json({ code: 0, msg: '新增成功' });
};

// 修改文章
exports.update = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  let cover = req.body.cover;
  if (!cover) cover = null;
  await db.execute(
    'UPDATE articles SET title=?, content=?, cover=? WHERE id=?',
    [title, content, cover, id]
  );
  res.json({ code: 0, msg: '修改成功' });
};

// 删除文章
exports.remove = async (req, res) => {
  const { id } = req.params;
  await db.execute('DELETE FROM articles WHERE id=?', [id]);
  res.json({ code: 0, msg: '删除成功' });
};