// src/controllers/merchantController.js
const Hotel = require('../models/Hotel');

// 允许更新的字段白名单
const editableFields = [
  'nameCn',
  'nameEn',
  'address',
  'city',
  'starRating',
  'openDate',
  'tags',
  'facilities',
  'nearbyAttractions',
  'transport',
  'malls',
  'images',
  'coverImage',
  'promotions',
  'roomTypes',
  'rating',
  'isFeatured',
  'featuredImage',
];

const pickPayload = (payload) => {
  const data = {};
  editableFields.forEach((field) => {
    if (payload[field] !== undefined) data[field] = payload[field];
  });
  return data;
};

// 创建酒店（商户）
const createHotel = async (req, res, next) => {
  try {
    const data = pickPayload(req.body);

    const hotel = await Hotel.create({
      ...data,
      owner: req.user.id,
      auditStatus: 'pending',
      isOnline: false,
    });

    return res.status(201).json({ message: 'Hotel created', hotel });
  } catch (error) {
    return next(error);
  }
};

// 获取我的酒店列表
const getMyHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.id }).sort({ createdAt: -1 });
    return res.json({ hotels });
  } catch (error) {
    return next(error);
  }
};

// 更新酒店（修改后需重新审核）
const updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findOne({ _id: req.params.id, owner: req.user.id });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const data = pickPayload(req.body);
    Object.assign(hotel, data);

    // 修改后需要重新审核
    hotel.auditStatus = 'pending';
    hotel.rejectReason = undefined;
    hotel.isOnline = false;

    await hotel.save();

    return res.json({ message: 'Hotel updated', hotel });
  } catch (error) {
    return next(error);
  }
};

// 删除酒店（商户）
const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    return res.json({ message: 'Hotel deleted' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createHotel,
  getMyHotels,
  updateHotel,
  deleteHotel,
};
