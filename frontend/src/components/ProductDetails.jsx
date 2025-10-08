import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button, Grid, Paper, Card, CardMedia, CardContent } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const API_PRODUCT_BASE = 'https://catalog-management-system-dev-ak3ogf6zeauc.a.run.app/cms/products';
const API_CART_ADD = 'http://localhost:5000/api/cart/add';

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartMessage, setCartMessage] = useState(null);

    // F-4 & F-10: Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_PRODUCT_BASE}/${id}`);
                if (!response.ok) {
                    throw new Error('Product not found or failed to fetch');
                }
                const data = await response.json();
                setProduct(data.products[0]); 
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // B-3: Add item to cart
    const handleAddToCart = async () => {
        if (!token) {
            setCartMessage({ severity: 'warning', text: 'Please log in to add items to the cart.' });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        try {
            const response = await fetch(API_CART_ADD, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to add item to cart');
            }

            setCartMessage({ severity: 'success', text: 'Item added to cart successfully!' });
        } catch (err) {
            setCartMessage({ severity: 'error', text: err.message });
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
    }
    
    if (!product) {
        return <Alert severity="warning" sx={{ mt: 4 }}>Product data is unavailable.</Alert>;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h3" gutterBottom>{product.name}</Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardMedia
                            component="img"
                            image={product.images && product.images.length > 0 ? product.images[0].url : ''}
                            alt={product.name}
                            sx={{ maxHeight: 500, objectFit: 'contain', p: 2 }}
                        />
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                {product.description || 'No detailed description available.'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Typography variant="h4" color="primary" gutterBottom>
                            ₹{product.price}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Category: {product.category}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Brand: {product.brand || 'N/A'}
                        </Typography>
                        
                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddToCart}
                                startIcon={<ShoppingCartIcon />}
                                disabled={!product.isAvailable}
                            >
                                {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                        </Box>
                        
                        {cartMessage && (
                            <Alert severity={cartMessage.severity} sx={{ mt: 2 }}>
                                {cartMessage.text}
                            </Alert>
                        )}
                        
                        <Button 
                            variant="outlined" 
                            sx={{ mt: 2 }} 
                            onClick={() => navigate('/')}
                        >
                            Back to Product List
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default ProductDetails;