// src/App.js - Only changes shown

import { Box, CssBaseline } from '@mui/material'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import Login from './components/Login';
import Register from './components/Register'; // <-- NEW IMPORT
import Cart from './components/Cart';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <CssBaseline /> 
                <Navbar />
                
                <Box 
                    sx={{
                        maxWidth: 'lg',
                        width: '100%', 
                        my: 0, 
                        mx: 'auto',
                        p: { xs: 1, md: 3 }
                    }}
                > 
                    <Routes>
                        <Route path="/" element={<ProductList />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} /> // <-- NEW ROUTE
                        <Route path="/cart" element={<Cart />} />
                    </Routes>
                </Box>
            </Router>
        </AuthProvider>
    );
}

export default App;