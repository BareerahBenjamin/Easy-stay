// src/models/Hotel.js
const mongoose = require('mongoose');

// 房型子文档
const roomTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, default: 2 },
    beds: { type: String },
    breakfastIncluded: { type: Boolean, default: false },
    refundable: { type: Boolean, default: false },
  },
  { _id: false }
);

// 促销子文档
const promotionSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    discountRate: { type: Number, min: 0, max: 1 }, // 例如 0.8 表示 8 折
    discountAmount: { type: Number, min: 0 }, // 例如 50 表示减 50 元
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { _id: false }
);

const hotelSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    nameCn: { type: String, required: true },
    nameEn: { type: String },
    address: { type: String, required: true },
    city: { type: String },
    starRating: { type: Number, min: 1, max: 5 },
    openDate: { type: Date },

    tags: [{ type: String }], // 亲子/豪华/免费停车场等
    facilities: [{ type: String }],

    nearbyAttractions: [{ type: String }],
    transport: [{ type: String }],
    malls: [{ type: String }],

    images: [{ type: String }],
    coverImage: { type: String },

    promotions: [promotionSchema],

    roomTypes: [roomTypeSchema],

    rating: { type: Number, default: 0 },

    // 审核流程
    auditStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectReason: { type: String },

    // 上下线（可恢复）
    isOnline: { type: Boolean, default: false },

    // 首页 Banner/推荐
    isFeatured: { type: Boolean, default: false },
    featuredImage: { type: String },

    // 便于查询的最低价
    minPrice: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// 保存前自动计算最低价
hotelSchema.pre('save', function () {
  if (Array.isArray(this.roomTypes) && this.roomTypes.length > 0) {
    const prices = this.roomTypes.map((r) => r.price).filter((p) => typeof p === 'number');
    this.minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  } else {
    this.minPrice = 0;
  }
});

module.exports = mongoose.model('Hotel', hotelSchema);
