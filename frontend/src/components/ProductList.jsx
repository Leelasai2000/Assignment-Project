import { useState, useEffect, useCallback, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress, Alert, Button, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://catalog-management-system-dev-ak3ogf6zeauc.a.run.app/cms/products';

// F-8: Utility for getting state from localStorage
const getInitialState = (key, defaultValue) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
        console.error("Error parsing localStorage key", key, e);
        return defaultValue;
    }
};

function ProductList() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pageState, setPageState] = useState(
        getInitialState('paginationState', { page: 0, pageSize: 10, totalProducts: 0 })
    );
    
    // F-5, F-6, F-7, F-8: State for filters and sorting
    const [categoryFilter, setCategoryFilter] = useState(getInitialState('categoryFilter', ''));
    const [searchQuery, setSearchQuery] = useState(getInitialState('searchQuery', ''));
    const [sortModel, setSortModel] = useState(getInitialState('sortModel', []));
    const [categories, setCategories] = useState([]);

    // F-8: Persist state to localStorage
    useEffect(() => {
        localStorage.setItem('paginationState', JSON.stringify(pageState));
        localStorage.setItem('categoryFilter', JSON.stringify(categoryFilter));
        localStorage.setItem('searchQuery', JSON.stringify(searchQuery));
        localStorage.setItem('sortModel', JSON.stringify(sortModel));
    }, [pageState, categoryFilter, searchQuery, sortModel]);

    // F-2, F-9, F-15 (API Fetching logic)
    const fetchProducts = useCallback(async () => {
        setLoading(true); // F-10: Loader
        setError(null);
        
        let url = `${API_BASE}?page=${pageState.page + 1}`;
        
        // F-7: Add sorting by price
        if (sortModel.length > 0) {
            const field = sortModel[0].field;
            const sort = sortModel[0].sort;
            if (field === 'price') {
                url += `&sortField=price&sortOrder=${sort === 'asc' ? 1 : -1}`;
            }
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch product data');
            }
            
            const data = await response.json();
            
            // Extract unique categories for the dropdown
            const uniqueCategories = [...new Set(data.products.map(p => p.category))];
            setCategories(prev => [...new Set([...prev, ...uniqueCategories])].sort());

            setProducts(data.products.map(p => ({
                ...p,
                id: p._id // DataGrid requires a unique 'id' field
            })));
            setPageState(prev => ({
                ...prev,
                totalProducts: data.totalProducts,
            }));
        } catch (err) {
            setError(err.message); // F-10: Error handling
        } finally {
            setLoading(false);
        }
    }, [pageState.page, sortModel]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // F-5, F-6: Client-side filtering
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, categoryFilter]);


    const columns = [
        { 
            field: 'images', 
            headerName: 'Image', 
            width: 80, 
            sortable: false, 
            renderCell: (params) => ( // F-3: Image rendering
                <img 
                    src={params.value && params.value.length > 0 ? params.value[0].url : ''} 
                    alt="Product" 
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                />
            ) 
        },
        { 
            field: 'name', 
            headerName: 'Product Name', 
            flex: 2,
            renderCell: (params) => ( // F-4: Link to details page
                <Button 
                    onClick={() => navigate(`/product/${params.id}`)}
                    style={{ textTransform: 'none', justifyContent: 'flex-start' }}
                >
                    {params.value}
                </Button>
            )
        },
        { 
            field: 'price', 
            headerName: 'Price (₹)', 
            flex: 1, 
            type: 'number' 
        }, // F-7: Sortable by price
        { 
            field: 'category', 
            headerName: 'Category', 
            flex: 1 
        },
    ];

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ height: 600, width: '100%', mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 2 }}>
    Product Catalog
</Typography>

            <Box display="flex" gap={2} mb={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField // F-5: Search Filter
                    label="Search by Product Name"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1 }}
                />

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select // F-6: Category Dropdown Filter
                        labelId="category-filter-label"
                        value={categoryFilter}
                        label="Category"
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>All Categories</em>
                        </MenuItem>
                        {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                                {cat}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {categoryFilter || searchQuery ? (
                    <Button 
                        onClick={() => {
                            setCategoryFilter(''); 
                            setSearchQuery('');
                        }}
                        variant="outlined"
                    >
                        Clear Filters
                    </Button>
                ) : null}
            </Box>
            
            {loading && ( // F-10: Loader
                <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress />
                </Box>
            )}

            <DataGrid // F-1: Use Datagrid
                rows={filteredProducts}
                columns={columns}
                paginationMode="server" // F-15: Pagination from datagrid
                rowCount={pageState.totalProducts}
                loading={loading}
                
                // F-9, F-15: Pagination state management
                paginationModel={{ page: pageState.page, pageSize: pageState.pageSize }}
                onPaginationModelChange={(model) => setPageState(prev => ({ ...prev, page: model.page, pageSize: model.pageSize }))}
                pageSizeOptions={[10, 25, 50]}
                
                // F-7: Sorting state management
                sortingMode="server"
                sortModel={sortModel}
                onSortModelChange={(newModel) => {
                    setSortModel(newModel);
                    // Reset page to 0 when sorting changes
                    setPageState(prev => ({ ...prev, page: 0 }));
                }}
                
                disableRowSelectionOnClick
                // F-10: Lazy loading is implicitly handled by server-side pagination fetch
            />
        </Box>
    );
}

export default ProductList;