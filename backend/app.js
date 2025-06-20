const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const userRoutes = require('./routes/user');
const articleRoutes = require('./routes/article');
const profileRoutes = require('./routes/profile');
const uploadRoutes = require('./routes/upload');
const logRoutes = require('./routes/log');
const logger = require('./middleware/logger');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(logger);

// 配置静态文件目录，确保上传的图片可以被访问
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/user', userRoutes);
app.use('/api/article', articleRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/log', logRoutes);

app.listen(3001, () => {
  console.log('Server running at http://localhost:3001');
});