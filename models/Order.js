const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: Number, unique: true },  // Unique, short identifier
    name: { type: String, required: true },
    items: [{ itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }, quantity: Number }],
    totalPrice: Number,
    time: { type: Date, default: Date.now }, // Automatically records the time when the order is created
    deliveryTime: { type: Date, required: true }, // User-selected delivery time
    status: { type: String, default: 'Pending' }, // "Pending" or  "Completed" status
});

module.exports = mongoose.model('Order', orderSchema);
