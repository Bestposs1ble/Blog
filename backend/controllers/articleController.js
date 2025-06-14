const db = require('../config/db');

// 获取所有文章
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM articles ORDER BY created_at DESC');
    res.json({ code: 0, data: rows });
  } catch (err) {
    console.error('DB ERROR:', err);
    res.status(500).json({ code: 1, msg: '数据库错误' });
  }
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
  try {
    const { title } = req.body;
    let content = req.body.content;
    // 先把 </p> 换成换行
    content = content.replace(/<\/p>/gi, '\n');
    // 去掉所有 HTML 标签
    content = content.replace(/<[^>]+>/g, '');
    
    // 处理封面图片URL
    let cover = req.body.cover;
    if (cover) {
      // 如果图片URL过长，只保留路径的最后部分
      if (cover.length > 250) {
        // 分割路径，只保留最后的文件名部分
        const parts = cover.split('/');
        cover = '/uploads/' + parts[parts.length - 1];
      }
    } else {
      cover = null;
    }
    
    await db.execute(
      'INSERT INTO articles (title, content, cover) VALUES (?, ?, ?)',
      [title, content, cover]
    );
    res.json({ code: 0, msg: '新增成功' });
  } catch (err) {
    console.error('新增文章失败:', err);
    res.status(500).json({ code: 1, msg: '新增文章失败: ' + err.message });
  }
};

// 修改文章
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    let content = req.body.content;
    // 先把 </p> 换成换行
    content = content.replace(/<\/p>/gi, '\n');
    // 去掉所有 HTML 标签
    content = content.replace(/<[^>]+>/g, '');
    
    // 处理封面图片URL
    let cover = req.body.cover;
    if (cover) {
      // 如果图片URL过长，只保留路径的最后部分
      if (cover.length > 250) {
        // 分割路径，只保留最后的文件名部分
        const parts = cover.split('/');
        cover = '/uploads/' + parts[parts.length - 1];
      }
    } else {
      cover = null;
    }
    
    await db.execute(
      'UPDATE articles SET title=?, content=?, cover=? WHERE id=?',
      [title, content, cover, id]
    );
    res.json({ code: 0, msg: '修改成功' });
  } catch (err) {
    console.error('修改文章失败:', err);
    res.status(500).json({ code: 1, msg: '修改文章失败: ' + err.message });
  }
};

// 删除文章
exports.remove = async (req, res) => {
  const { id } = req.params;
  await db.execute('DELETE FROM articles WHERE id=?', [id]);
  res.json({ code: 0, msg: '删除成功' });
};

// 点赞接口
exports.like = async (req, res) => {
  const { id } = req.params;
  await db.execute('UPDATE articles SET likes = likes + 1 WHERE id = ?', [id]);
  const [rows] = await db.execute('SELECT likes FROM articles WHERE id = ?', [id]);
  res.json({ code: 0, likes: rows[0].likes });
};