const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user');
const articleRoutes = require('./routes/article');
const profileRoutes = require('./routes/profile');
const uploadRoutes = require('./routes/upload');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/user', userRoutes);
app.use('/api/article', articleRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static(__dirname + '/public/uploads'));

app.listen(3001, () => {
  console.log('Server running at http://localhost:3001');
});