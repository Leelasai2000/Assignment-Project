const User = require('../models/User'); 

const getCart = async (req, res) => {
    try {
        
        const user = await User.findById(req.user.id).select('cart');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const addToCart = async (req, res) => {
    const { productId, name, price, quantity = 1 } = req.body; 

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        
        let itemIndex = user.cart.findIndex(item => item.productId === productId);

        if (itemIndex > -1) {
            
            user.cart[itemIndex].quantity += quantity;
        } else {
            // Add new item to cart
            user.cart.push({ productId, name, price, quantity });
        }

        await user.save();
        res.json(user.cart); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const checkout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        const placedOrder = user.cart;

        
        user.cart = [];
        await user.save();

        res.json({ msg: 'Order placed successfully', order: placedOrder });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getCart, addToCart, checkout };
