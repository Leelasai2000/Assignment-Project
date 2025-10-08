// src/components/Login.jsx - Only changes shown

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- ADDED Link
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api/auth/login';

function Login() {
    // ... (rest of the component state and login logic is unchanged)

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
                <Typography variant="h5" component="h1" gutterBottom align="center">
                    User Login
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                </Box>
                <Typography variant="body2" align="center">
                    Don't have an account? <Link to="/register">Sign Up Here</Link> {/* <-- FIXED LINK */}
                </Typography>
            </Paper>
        </Box>
    );
}

export default Login;