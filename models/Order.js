const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

OrderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order', OrderSchema);
