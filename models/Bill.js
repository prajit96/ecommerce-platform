const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      itemType: {
        type: String,
        required: true,
        enum: ['Product', 'Course'],
      },
      item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'items.itemType', 
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  taxes: {
    type: Number,
    default: 0,
  },
  discounts: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Bill', BillSchema);
