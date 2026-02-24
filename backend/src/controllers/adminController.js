// src/controllers/adminController.js
const Hotel = require('../models/Hotel');

// 管理员可编辑的酒店字段
const adminEditableFields = [
  'owner',
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
  'auditStatus',
  'rejectReason',
  'isOnline',
  'minPrice',
];

const pickAdminPayload = (payload) => {
  const data = {};
  adminEditableFields.forEach((field) => {
    if (payload[field] !== undefined) data[field] = payload[field];
  });
  return data;
};

// 管理员查看酒店列表（可筛选状态）
const listHotels = async (req, res, next) => {
  try {
    const { status, keyword, isOnline } = req.query;

    const query = {};
    if (status) query.auditStatus = status;
    if (isOnline !== undefined) query.isOnline = isOnline === 'true';

    if (keyword) {
      query.$or = [
        { nameCn: { $regex: keyword, $options: 'i' } },
        { nameEn: { $regex: keyword, $options: 'i' } },
        { address: { $regex: keyword, $options: 'i' } },
        { city: { $regex: keyword, $options: 'i' } },
      ];
    }

    const hotels = await Hotel.find(query).sort({ updatedAt: -1 });
    return res.json({ hotels });
  } catch (error) {
    return next(error);
  }
};

// 管理员获取酒店详情
const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    return res.json({ hotel });
  } catch (error) {
    return next(error);
  }
};

// 管理员创建酒店（需指定 owner）
const createHotel = async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.owner) {
      return res.status(400).json({ message: 'Owner is required' });
    }

    const data = pickAdminPayload(body);
    const auditStatus = data.auditStatus || 'pending';
    const isOnline = data.isOnline === true;

    if (isOnline && auditStatus !== 'approved') {
      return res.status(400).json({ message: 'Hotel must be approved before publishing' });
    }

    const hotel = await Hotel.create({
      ...data,
      auditStatus,
      isOnline,
    });

    return res.status(201).json({ message: 'Hotel created', hotel });
  } catch (error) {
    return next(error);
  }
};

// 管理员更新酒店（可调整审核/上下线）
const updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const data = pickAdminPayload(req.body);
    const nextAuditStatus = data.auditStatus ?? hotel.auditStatus;
    const nextIsOnline = data.isOnline ?? hotel.isOnline;

    if (nextIsOnline === true && nextAuditStatus !== 'approved') {
      return res.status(400).json({ message: 'Hotel must be approved before publishing' });
    }

    Object.assign(hotel, data);
    await hotel.save();

    return res.json({ message: 'Hotel updated', hotel });
  } catch (error) {
    return next(error);
  }
};

// 管理员删除酒店
const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    return res.json({ message: 'Hotel deleted' });
  } catch (error) {
    return next(error);
  }
};

// 审核酒店：通过/驳回
const auditHotel = async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid audit status' });
    }

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    hotel.auditStatus = status;
    hotel.rejectReason = status === 'rejected' ? reason || '审核未通过' : undefined;

    if (status === 'rejected') {
      hotel.isOnline = false;
    }

    await hotel.save();

    return res.json({ message: 'Audit updated', hotel });
  } catch (error) {
    return next(error);
  }
};

// 上线酒店（需审核通过）
const publishHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.auditStatus !== 'approved') {
      return res.status(400).json({ message: 'Hotel must be approved before publishing' });
    }

    hotel.isOnline = true;
    await hotel.save();

    return res.json({ message: 'Hotel published', hotel });
  } catch (error) {
    return next(error);
  }
};

// 下线酒店（可恢复）
const offlineHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    hotel.isOnline = false;
    await hotel.save();

    return res.json({ message: 'Hotel offline', hotel });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  auditHotel,
  publishHotel,
  offlineHotel,
};
