import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HomeIcon from '@mui/icons-material/Home';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static" color="primary" elevation={4}>
            <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 'lg', width: '100%', mx: 'auto' }}>
                
                <Button component={Link} to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 1 }} />
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}
                    >
                        E-Commerce CMS
                    </Typography>
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                    {user ? (
                        <>
                           
                            <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                Welcome, **{user.username}**
                            </Typography>

                           
                            <IconButton color="inherit" component={Link} to="/cart" aria-label="cart">
                                <ShoppingCartIcon />
                            </IconButton>

                            
                            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ whiteSpace: 'nowrap' }}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                          
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/login" 
                                startIcon={<LoginIcon />}
                            >
                                Login
                            </Button>
                            
                            
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/register" 
                                startIcon={<PersonAddIcon />}
                                sx={{ display: { xs: 'none', sm: 'flex' } }}
                            >
                                Register
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
