const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const Hotel = require('./src/models/Hotel');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const data = JSON.parse(await fs.readFile(path.join(__dirname, '../api/data/hotels.json'), 'utf-8'));
  
  // 格式化并导入
  const formatted = data.hotels.map(h => ({
    ...h,
    _id: new mongoose.Types.ObjectId(), // 如果需要保留旧ID请手动映射
    status: h.status || 'published'
  }));

  await Hotel.insertMany(formatted);
  console.log('Data Imported!');
  process.exit();
}

run();