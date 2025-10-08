// src/components/Register.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';

const API_REGISTER_URL = 'http://localhost:5000/api/auth/register';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(API_REGISTER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Registration failed');
            }

            setSuccess(true);
            // B-1: Redirect to login after successful registration
            setTimeout(() => navigate('/login'), 1500); 

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
                <Typography variant="h5" component="h1" gutterBottom align="center">
                    Register User
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>Registration successful! Redirecting to login...</Alert>}
                
                <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
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
                        Sign Up
                    </Button>
                </Box>
                <Typography variant="body2" align="center">
                    Already have an account? <Link to="/login">Sign In</Link>
                </Typography>
            </Paper>
        </Box>
    );
}

export default Register;