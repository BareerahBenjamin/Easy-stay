// src/routes/hotels.js
const express = require('express');
const { listHotels, getHotelDetail } = require('../controllers/hotelController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 酒店列表
router.get('/', listHotels);

// 酒店详情（可选鉴权，管理员/商户可查看未上线）
router.get('/:id', optionalAuth, getHotelDetail);

module.exports = router;
