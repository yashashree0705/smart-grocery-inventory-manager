const mongoose = require('mongoose');
const GroceryItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true, default: 'Pcs' },
  category: { type: String, required: true, default: 'Other' },
  minStockLimit: { type: Number, required: true, default: 2 },
  expiryDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('GroceryItem', GroceryItemSchema);
