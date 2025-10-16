import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Paper, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
import { ShoppingCartCheckout as CheckoutIcon, RemoveShoppingCart as EmptyCartIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const BACKEND_BASE = 'http://localhost:5000/api/cart';

function Cart() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkoutMessage, setCheckoutMessage] = useState(null);

  
    const fetchCart = useCallback(async () => {
        if (!token) {
            setLoading(false);
            setCart([]);
            return;
        }

        setLoading(true);
        setError(null);
        setCheckoutMessage(null);

        try {
            const response = await fetch(`${BACKEND_BASE}`, {
                headers: {
                    'x-auth-token': token,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to fetch cart.');
            }

            setCart(data);
        } catch (err) {
            setError(err.message.includes("Failed to fetch") 
                ? `Network Error: Could not reach the backend server. Ensure your Node.js server is running.`
                : err.message
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    
    const handleCheckout = async () => {
        if (!token) return;

        setLoading(true);
        setCheckoutMessage(null);

        try {
            const response = await fetch(`${BACKEND_BASE}/checkout`, {
                method: 'POST',
                headers: {
                    'x-auth-token': token,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Checkout failed.');
            }

            // Requirement 9: Empty the cart after placing the order
            setCart([]); 
            setCheckoutMessage({ severity: 'success', text: 'Order placed successfully! Your cart is now empty.' });

        } catch (err) {
            setCheckoutMessage({ 
                severity: 'error', 
                text: err.message.includes('Failed to fetch') 
                    ? `Network Error: Could not reach backend.`
                    : err.message 
            });
        } finally {
            setLoading(false);
        }
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cart]);

    if (!token) {
        return (
            <Alert severity="info" sx={{ mt: 4 }}>
                <Typography variant="h6">Authentication Required</Typography>
                Please <Button component={Button} onClick={() => navigate('/login')}>Login</Button> to view and manage your cart.
            </Alert>
        );
    }

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress size={60} /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
    }

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
                Shopping Cart
            </Typography>

            {checkoutMessage && <Alert severity={checkoutMessage.severity} sx={{ mb: 2 }}>{checkoutMessage.text}</Alert>}

            {cart.length === 0 ? (
                <Alert severity="info" icon={<EmptyCartIcon />} sx={{ mt: 3 }}>
                    Your cart is empty. <Button component={Button} onClick={() => navigate('/')} size="small">Browse Products</Button>
                </Alert>
            ) : (
                <Paper elevation={3} sx={{ p: 2, borderRadius: '12px' }}>
                    <List>
                        {cart.map((item, index) => (
                            <React.Fragment key={item.productId}>
                                <ListItem>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={`Quantity: ${item.quantity} x ₹${item.price.toLocaleString('en-IN')}`}
                                    />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </Typography>
                                </ListItem>
                                {index < cart.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                        <Divider sx={{ my: 2, borderBottomWidth: 2 }} />
                        <ListItem>
                            <ListItemText primary={<Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total</Typography>} />
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                ₹{cartTotal.toLocaleString('en-IN')}
                            </Typography>
                        </ListItem>
                    </List>

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<CheckoutIcon />}
                        sx={{ mt: 3, py: 1.5 }}
                        onClick={handleCheckout}
                        disabled={loading}
                    >
                        Place Order (Checkout)
                    </Button>
                </Paper>
            )}
        </Box>
    );
}

export default Cart;
