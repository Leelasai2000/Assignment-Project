import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext'; 

const API_BASE = 'https://catalog-management-system-dev-ak3ogf6zeauc.a.run.app/cms';

const BACKEND_BASE = 'http://localhost:5000/api/cart/add'; 

function ProductDetails() {
    const { id } = useParams();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartMessage, setCartMessage] = useState(null);

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            
            const url = `${API_BASE}/products/${id}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to load product details: ${response.status}`);
            }

            const data = await response.json();
            setProduct(data.product);

        } catch (err) {
            setError(`Error fetching product details: ${err.message}. This is likely the expected CORS error for the product API.`);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    
    const handleAddToCart = async () => {
        if (!token) {
            setCartMessage({ severity: 'warning', text: 'You must be logged in to add items to the cart.' });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        if (!product) return;

        setCartMessage(null);
        try {
            const response = await fetch(BACKEND_BASE, {
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to add item to cart.');
            }

            
            setCartMessage({ severity: 'success', text: `${product.name} added to cart!` });
        } catch (err) {
            setCartMessage({ 
                severity: 'error', 
                text: err.message.includes('Failed to fetch') 
                    ? `Network Error: Could not reach backend at http://localhost:5000. Ensure your Node.js server is running.`
                    : err.message 
            });
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress size={60} /></Box>;
    }

    if (error || !product) {
        return <Alert severity="error" sx={{ mt: 4 }}>{error || "Product not found."}</Alert>;
    }

    return (
        <Card sx={{ maxWidth: 900, mx: 'auto', mt: 4, boxShadow: 6 }}>
            <CardContent>
                <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
                    {product.name}
                </Typography>
                
                {cartMessage && <Alert severity={cartMessage.severity} sx={{ mb: 2 }}>{cartMessage.text}</Alert>}

                <Grid container spacing={4} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                        <CardMedia
                            component="img"
                            image={product.images && product.images.length > 0 ? product.images[0].url : 'https://placehold.co/400x300/cccccc/000000?text=Product+Image'}
                            alt={product.name}
                            sx={{ maxHeight: 400, width: '100%', objectFit: 'contain', borderRadius: '8px' }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ p: 1 }}>
                            <Typography variant="h4" color="primary" sx={{ my: 2 }}>
                                ₹{product.price.toLocaleString('en-IN')}
                            </Typography>
                            
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                                Category: **{product.category || 'N/A'}**
                            </Typography>
                            
                            <Typography variant="body1" paragraph>
                                **Description:** {product.description || 'No detailed description available.'}
                            </Typography>
                            
                            <Button 
                                variant="contained" 
                                color="primary" 
                                fullWidth 
                                onClick={handleAddToCart}
                                sx={{ mt: 3, py: 1.5 }}
                                disabled={!token}
                            >
                                {token ? 'Add to Cart' : 'Login to Add to Cart'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}

export default ProductDetails;
