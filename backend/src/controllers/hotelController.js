// src/controllers/hotelController.js
const Hotel = require('../models/Hotel');

// 酒店列表（公开）
const listHotels = async (req, res, next) => {
  try {
    const {
      city,
      keyword,
      minPrice,
      maxPrice,
      starRating,
      tags,
      page = 1,
      pageSize = 10,
    } = req.query;

    const query = {
      auditStatus: 'approved',
      isOnline: true,
    };

    if (city) query.city = city;

    if (keyword) {
      query.$or = [
        { nameCn: { $regex: keyword, $options: 'i' } },
        { nameEn: { $regex: keyword, $options: 'i' } },
        { address: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.minPrice = {};
      if (minPrice) query.minPrice.$gte = Number(minPrice);
      if (maxPrice) query.minPrice.$lte = Number(maxPrice);
    }

    if (starRating) {
      const stars = starRating.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
      if (stars.length > 0) query.starRating = { $in: stars };
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) query.tags = { $in: tagList };
    }

    const pageNum = Math.max(Number(page), 1);
    const sizeNum = Math.min(Math.max(Number(pageSize), 1), 50);

    const [total, hotels] = await Promise.all([
      Hotel.countDocuments(query),
      Hotel.find(query)
        .sort({ minPrice: 1, updatedAt: -1 })
        .skip((pageNum - 1) * sizeNum)
        .limit(sizeNum),
    ]);

    return res.json({
      page: pageNum,
      pageSize: sizeNum,
      total,
      hotels,
    });
  } catch (error) {
    return next(error);
  }
};

// 酒店详情（公开）
const getHotelDetail = async (req, res, next) => {
  try {
    const user = req.user;
    const hotelId = req.params.id;

    // 默认只允许查看通过审核且已上线的酒店
    let query = { _id: hotelId, auditStatus: 'approved', isOnline: true };

    // 如果有登录用户且是管理员/该酒店商户，可查看未上线数据
    if (user && (user.role === 'admin' || user.role === 'merchant')) {
      const isOwner = user.role === 'merchant'
        ? { _id: hotelId, owner: user.id }
        : { _id: hotelId };
      query = isOwner;
    }

    const hotel = await Hotel.findOne(query);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // 房型价格从低到高排序
    const sortedRoomTypes = [...(hotel.roomTypes || [])].sort((a, b) => a.price - b.price);

    return res.json({
      hotel: {
        ...hotel.toObject(),
        roomTypes: sortedRoomTypes,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listHotels,
  getHotelDetail,
};
