const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
});

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true, 
        trim: true
    },
    password: { 
        type: String,
        required: true,
    },
    cart: [CartItemSchema] 
}, {
    timestamps: true 
});

module.exports = mongoose.model('User', UserSchema);