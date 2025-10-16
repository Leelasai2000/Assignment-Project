const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const { getCart, addToCart, checkout } = require('../controllers/cartController');




router.get('/', auth, getCart);

router.post('/add', auth, addToCart); 


router.post('/checkout', auth, checkout); 

module.exports = router;
