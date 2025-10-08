import { useState, useEffect, useCallback, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress, Alert, Button, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://catalog-management-system-dev-ak3ogf6zeauc.a.run.app/cms/products';

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

    
    useEffect(() => {
        localStorage.setItem('paginationState', JSON.stringify(pageState));
        localStorage.setItem('categoryFilter', JSON.stringify(categoryFilter));
        localStorage.setItem('searchQuery', JSON.stringify(searchQuery));
        localStorage.setItem('sortModel', JSON.stringify(sortModel));
    }, [pageState, categoryFilter, searchQuery, sortModel]);

    
    const fetchProducts = useCallback(async () => {
        setLoading(true); 
        setError(null);
        
        let url = `${API_BASE}?page=${pageState.page + 1}`;
        
        
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
            
            
            const uniqueCategories = [...new Set(data.products.map(p => p.category))];
            setCategories(prev => [...new Set([...prev, ...uniqueCategories])].sort());

            setProducts(data.products.map(p => ({
                ...p,
                id: p._id 
            })));
            setPageState(prev => ({
                ...prev,
                totalProducts: data.totalProducts,
            }));
        } catch (err) {
            setError(err.message); 
        } finally {
            setLoading(false);
        }
    }, [pageState.page, sortModel]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    
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
            renderCell: (params) => ( 
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
            renderCell: (params) => ( 
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
        }, 
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
                <TextField 
                    label="Search by Product Name"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1 }}
                />

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select 
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
            
            {loading && ( 
                <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress />
                </Box>
            )}

            <DataGrid 
                rows={filteredProducts}
                columns={columns}
                paginationMode="server" 
                rowCount={pageState.totalProducts}
                loading={loading}
                
                
                paginationModel={{ page: pageState.page, pageSize: pageState.pageSize }}
                onPaginationModelChange={(model) => setPageState(prev => ({ ...prev, page: model.page, pageSize: model.pageSize }))}
                pageSizeOptions={[10, 25, 50]}
                
                
                sortingMode="server"
                sortModel={sortModel}
                onSortModelChange={(newModel) => {
                    setSortModel(newModel);
                    
                    setPageState(prev => ({ ...prev, page: 0 }));
                }}
                
                disableRowSelectionOnClick
                
            />
        </Box>
    );
}

export default ProductList;