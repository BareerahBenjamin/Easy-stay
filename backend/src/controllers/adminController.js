const Hotel = require('../models/Hotel');

// 审核酒店
exports.reviewHotel = async (req, res) => {
  const { approved, reason } = req.body;
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    if (hotel.status !== 'auditing') return res.status(409).json({ message: 'Invalid transition' });

    hotel.status = approved ? 'approved' : 'rejected';
    hotel.rejectReason = approved ? '' : reason;
    await hotel.save();
    
    res.json({ code: 'OK', data: hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 上架发布
exports.publishHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, status: 'approved' },
      { status: 'published' },
      { new: true }
    );
    if (!hotel) return res.status(400).json({ message: 'Only approved hotel can be published' });
    res.json({ code: 'OK', data: hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 下架
exports.offlineHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, status: 'published' },
      { status: 'offline' },
      { new: true }
    );
    res.json({ code: 'OK', data: hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};