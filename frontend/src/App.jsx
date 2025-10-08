import { Box, CssBaseline } from '@mui/material'; // Changed import: Box instead of Container
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import Login from './components/Login';
import Cart from './components/Cart';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <CssBaseline /> 
                <Navbar />
                
                {/* This Box component explicitly centers content horizontally 
                  using standard CSS centering properties (mx: 'auto') 
                  and sets a maximum width for the entire content area.
                */}
                <Box 
                    sx={{
                        maxWidth: 'lg', // Corresponds to the 'lg' breakpoint max-width
                        width: '100%', 
                        my: 0, 
                        mx: 'auto', // FORCES horizontal centering
                        p: { xs: 1, md: 3 } // Adds responsive padding around the content
                    }}
                > 
                    <Routes>
                        <Route path="/" element={<ProductList />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/cart" element={<Cart />} />
                    </Routes>
                </Box>
            </Router>
        </AuthProvider>
    );
}

export default App;