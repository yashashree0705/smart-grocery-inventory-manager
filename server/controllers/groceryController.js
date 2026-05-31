const GroceryItem = require('../models/GroceryItem');
exports.getAllItems = async (req, res) => {
  try {
    const items = await GroceryItem.find({ userId: req.user.id }).sort({ expiryDate: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to balance inventory record arrays.' });
  }
};
exports.createItem = async (req, res) => {
  try {
    const { name, quantity, unit, category, minStockLimit, expiryDate } = req.body;
    const newItem = new GroceryItem({ userId: req.user.id, name, quantity, unit, category, minStockLimit, expiryDate });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ msg: 'Data parsing violation tracking raw item attributes.' });
  }
};
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await GroceryItem.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ msg: 'Target inventory reference missing.' });
    item.quantity = Math.max(0, quantity);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to commit item stock quantity changes.' });
  }
};
exports.deleteItem = async (req, res) => {
  try {
    const item = await GroceryItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ msg: 'Target inventory item record not isolated.' });
    res.json({ msg: 'Pantry index element cleared out successfully.' });
  } catch (err) {
    res.status(500).json({ msg: 'Purging item data from collection pool rejected.' });
  }
};
exports.getDashboardSummary = async (req, res) => {
  try {
    const items = await GroceryItem.find({ userId: req.user.id });
    const currentTimestamp = new Date();
    const safetyBufferThreshold = new Date();
    safetyBufferThreshold.setDate(currentTimestamp.getDate() + 3);
    let lowStockCount = 0;
    let expiredCount = 0;
    const shoppingListSuggestions = [];
    items.forEach(item => {
      if (item.quantity <= item.minStockLimit) {
        lowStockCount++;
        shoppingListSuggestions.push({
          name: item.name,
          reason: 'Low Stock Level',
          suggestedQty: (item.minStockLimit * 2) - item.quantity,
          unit: item.unit
        });
      }
      if (new Date(item.expiryDate) <= safetyBufferThreshold) {
        expiredCount++;
      }
    });
    res.json({ totalUniqueItems: items.length, lowStockCount, expiredCount, shoppingListSuggestions });
  } catch (err) {
    res.status(500).json({ msg: 'Analytics evaluation compilation collapsed.' });
  }
};
