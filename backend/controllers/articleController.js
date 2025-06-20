const db = require('../config/db');

// 获取所有文章
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM articles ORDER BY created_at DESC');
    res.json({ code: 0, data: rows });
  } catch (err) {
    console.error('获取文章列表错误:', err);
    res.status(500).json({ code: 1, msg: '数据库错误: ' + err.message });
  }
};

// 获取单篇文章
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    // 先自增阅读量
    await db.execute('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);
    const [rows] = await db.execute('SELECT * FROM articles WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.json({ code: 1, msg: '文章不存在' });
    }
    
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    console.error('获取文章详情错误:', err);
    res.status(500).json({ code: 1, msg: '获取文章失败: ' + err.message });
  }
};

// 新增文章
exports.create = async (req, res) => {
  try {
    const { title, content, cover } = req.body;
    
    // 参数验证
    if (!title || title.trim() === '') {
      return res.status(400).json({ code: 1, msg: '标题不能为空' });
    }
    
    // 确保内容是有效的HTML
    let safeContent = '<p><br></p>'; // 默认空内容
    
    if (content && typeof content === 'string') {
      // 检查是否只有空标签
      const contentWithoutTags = content.replace(/<[^>]*>/g, '').trim();
      if (contentWithoutTags) {
        // 内容不为空，保留原始HTML
        safeContent = content;
      } else {
        // 检查是否有图片标签
        if (content.includes('<img')) {
          // 有图片，保留原始HTML
          safeContent = content;
        } else {
          // 真的是空内容
          safeContent = '<p><br></p>';
        }
      }
    }
    
    console.log('新增文章数据:', {
      title,
      contentLength: safeContent.length,
      contentPreview: safeContent.substring(0, 100),
      cover: cover ? '有封面' : '无封面'
    });
    
    // 执行插入操作
    const [result] = await db.execute(
      'INSERT INTO articles (title, content, cover) VALUES (?, ?, ?)',
      [title, safeContent, cover]
    );
    
    if (result.affectedRows === 1) {
      res.json({ code: 0, msg: '新增成功', id: result.insertId });
    } else {
      throw new Error('插入失败，影响行数为0');
    }
  } catch (err) {
    console.error('新增文章失败:', err);
    res.status(500).json({ code: 1, msg: '新增文章失败: ' + err.message });
  }
};

// 修改文章
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, cover } = req.body;
    
    // 参数验证
    if (!title || title.trim() === '') {
      return res.status(400).json({ code: 1, msg: '标题不能为空' });
    }
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ code: 1, msg: '无效的文章ID' });
    }
    
    // 确保内容是有效的HTML
    let safeContent = '<p><br></p>'; // 默认空内容
    
    if (content && typeof content === 'string') {
      // 检查是否只有空标签
      const contentWithoutTags = content.replace(/<[^>]*>/g, '').trim();
      if (contentWithoutTags) {
        // 内容不为空，保留原始HTML
        safeContent = content;
      } else {
        // 检查是否有图片标签
        if (content.includes('<img')) {
          // 有图片，保留原始HTML
          safeContent = content;
        } else {
          // 真的是空内容
          safeContent = '<p><br></p>';
        }
      }
    }
    
    console.log('修改文章数据:', {
      id,
      title,
      contentLength: safeContent.length,
      contentPreview: safeContent.substring(0, 100),
      cover: cover ? '有封面' : '无封面'
    });
    
    // 检查文章是否存在
    const [existing] = await db.execute('SELECT id FROM articles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ code: 1, msg: '文章不存在' });
    }
    
    // 执行更新操作
    const [result] = await db.execute(
      'UPDATE articles SET title=?, content=?, cover=? WHERE id=?',
      [title, safeContent, cover, id]
    );
    
    if (result.affectedRows === 1) {
      res.json({ code: 0, msg: '修改成功' });
    } else {
      throw new Error('更新失败，影响行数为0');
    }
  } catch (err) {
    console.error('修改文章失败:', err);
    res.status(500).json({ code: 1, msg: '修改文章失败: ' + err.message });
  }
};

// 删除文章
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ code: 1, msg: '无效的文章ID' });
    }
    
    const [result] = await db.execute('DELETE FROM articles WHERE id=?', [id]);
    
    if (result.affectedRows === 1) {
      res.json({ code: 0, msg: '删除成功' });
    } else {
      res.status(404).json({ code: 1, msg: '文章不存在或已被删除' });
    }
  } catch (err) {
    console.error('删除文章失败:', err);
    res.status(500).json({ code: 1, msg: '删除文章失败: ' + err.message });
  }
};

// 点赞接口
exports.like = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ code: 1, msg: '无效的文章ID' });
    }
    
    await db.execute('UPDATE articles SET likes = likes + 1 WHERE id = ?', [id]);
    const [rows] = await db.execute('SELECT likes FROM articles WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, msg: '文章不存在' });
    }
    
    res.json({ code: 0, likes: rows[0].likes });
  } catch (err) {
    console.error('文章点赞失败:', err);
    res.status(500).json({ code: 1, msg: '点赞失败: ' + err.message });
  }
};