import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Card, CardContent, Grid } from '@mui/material';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useAuth } from '../context/AuthContext';

const API_CART_BASE = 'http://localhost:5000/api/cart';

function Cart() {
  const { token } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setError('You must be logged in to view your cart.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setCheckoutMessage(null);

    try {
      const response = await fetch(API_CART_BASE, {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to fetch cart data');
      }

      const data = await response.json();
      setCart(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // B-2: Fetch cart on component mount/token change
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // B-4: Handle checkout and empty cart
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutMessage({ severity: 'warning', text: 'Your cart is already empty.' });
      return;
    }

    try {
      const response = await fetch(`${API_CART_BASE}/checkout`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Checkout failed');
      }

      setCart([]); // Clear frontend state
      setCheckoutMessage({ severity: 'success', text: 'Order placed successfully! Your cart has been emptied.' });
    } catch (err) {
      setCheckoutMessage({ severity: 'error', text: err.message });
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>Your Shopping Cart</Typography>

      {checkoutMessage && <Alert severity={checkoutMessage.severity} sx={{ mb: 3 }}>{checkoutMessage.text}</Alert>}

      {!token ? (
        <Alert severity="info">Please log in to view your personalized cart data.</Alert>
      ) : cart.length === 0 ? (
        <Alert severity="info">Your cart is currently empty.</Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cart.map((item) => (
              <Card key={item.productId} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container alignItems="center">
                    <Grid item xs={8}>
                      <Typography variant="h6">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price: ₹{item.price}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body1">Qty: {item.quantity}</Typography>
                    </Grid>
                    <Grid item xs={2} sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle1">
                        Total: ₹{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom>Cart Summary</Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                  Subtotal: ₹{subtotal.toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={handleCheckout}
                  startIcon={<ShoppingCartCheckoutIcon />}
                  disabled={cart.length === 0}
                >
                  Place Order & Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Cart;