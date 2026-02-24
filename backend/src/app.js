// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const merchantRoutes = require('./routes/merchant');
const adminRoutes = require('./routes/admin');
const hotelRoutes = require('./routes/hotels');
const homeRoutes = require('./routes/home');

// 加载环境变量
dotenv.config();

const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// 健康检查
app.get('/', (_req, res) => {
  res.send('Server is running');
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/public/home', homeRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 全局错误处理
app.use((err, _req, res, _next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Server error', detail: err.message });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});