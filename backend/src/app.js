const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// 路由导入
const authRoutes = require('./routes/auth');
const merchantRoutes = require('./routes/merchant');
const adminRoutes = require('./routes/admin');
const hotelRoutes = require('./routes/hotels');

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// 路由映射
app.use('/api/auth', authRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/h5/hotels', hotelRoutes); // 对应原 api/server.js 的公开接口

app.use((err, req, res, next) => {
  res.status(500).json({ code: 'ERROR', message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));