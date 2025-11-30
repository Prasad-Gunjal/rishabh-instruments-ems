import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Pending as PendingIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import apiService from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const MaterialManagement = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [materialForApproval, setMaterialForApproval] = useState(null);
  const [approvalAction, setApprovalAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    unit: '',
    quantityAvailable: 0,
    minStockLevel: 10,
    maxStockLevel: 100,
    unitPrice: 0,
    supplierName: '',
    supplierContact: '',
    supplierEmail: '',
    supplierAddress: '',
    warehouse: '',
    rack: '',
    bin: '',
    qualityGrade: 'A',
    expiryDate: '',
    specifications: {},
  });

  // Handle approval/rejection actions
  const handleApprovalStatusChange = async (materialId, newStatus, reason = '') => {
    try {
      if (newStatus === 'approved') {
        await apiService.approveMaterial(materialId);
        toast.success('Material approved successfully');
      } else if (newStatus === 'rejected') {
        if (!reason.trim()) {
          toast.error('Please provide a rejection reason');
          return;
        }
        await apiService.rejectMaterial(materialId, { reason });
        toast.success('Material rejected successfully');
      }
      
      // Refresh materials list
      await fetchMaterials();
      
      // Close any open dialogs and reset state
      setOpenApprovalDialog(false);
      setOpenViewDialog(false);
      setOpenDialog(false);
      setMaterialForApproval(null);
      setApprovalAction('');
      setRejectionReason('');
      setSelectedMaterial(null);
      
    } catch (error) {
      console.error('Error updating approval status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update approval status';
      toast.error(errorMessage);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMaterials();
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Filter materials based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  }, [materials, searchTerm]);

  const handleAddMaterial = () => {
    setSelectedMaterial(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      subCategory: '',
      unit: '',
      quantityAvailable: 0,
      minStockLevel: 10,
      maxStockLevel: 100,
      unitPrice: 0,
      supplierName: '',
      supplierContact: '',
      supplierEmail: '',
      supplierAddress: '',
      warehouse: '',
      rack: '',
      bin: '',
      qualityGrade: 'A',
      expiryDate: '',
      specifications: {},
    });
    setOpenDialog(true);
  };

  const handleEditMaterial = (material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name || '',
      description: material.description || '',
      category: material.category || '',
      subCategory: material.subCategory || '',
      unit: material.unit || '',
      quantityAvailable: material.quantityAvailable || 0,
      minStockLevel: material.minStockLevel || 10,
      maxStockLevel: material.maxStockLevel || 100,
      unitPrice: material.unitPrice || 0,
      supplierName: material.supplier?.name || '',
      supplierContact: material.supplier?.contact || '',
      supplierEmail: material.supplier?.email || '',
      supplierAddress: material.supplier?.address || '',
      warehouse: material.location?.warehouse || '',
      rack: material.location?.rack || '',
      bin: material.location?.bin || '',
      qualityGrade: material.qualityGrade || 'A',
      expiryDate: material.expiryDate ? new Date(material.expiryDate).toISOString().split('T')[0] : '',
      specifications: material.specifications || {},
    });
    setOpenDialog(true);
  };

  const handleViewMaterial = (material) => {
    setSelectedMaterial(material);
    setOpenViewDialog(true);
  };

  const handleDeleteMaterial = (material) => {
    setMaterialToDelete(material);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteMaterial(materialToDelete._id);
      setError('');
      await fetchMaterials();
      setOpenDeleteDialog(false);
      setMaterialToDelete(null);
    } catch (error) {
      console.error('Error deleting material:', error);
      setError(error.response?.data?.message || 'Failed to delete material');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenViewDialog(false);
    setOpenDeleteDialog(false);
    setOpenApprovalDialog(false);
    setSelectedMaterial(null);
    setMaterialToDelete(null);
    setMaterialForApproval(null);
    setApprovalAction('');
    setDialogError('');
    setFormData({
      name: '',
      description: '',
      category: '',
      subCategory: '',
      unit: '',
      quantityAvailable: 0,
      minStockLevel: 10,
      maxStockLevel: 100,
      unitPrice: 0,
      supplierName: '',
      supplierContact: '',
      supplierEmail: '',
      supplierAddress: '',
      warehouse: '',
      rack: '',
      bin: '',
      qualityGrade: 'A',
      expiryDate: '',
      specifications: {},
    });
  };

  // Approval Functions
  const handleApprovalAction = (material, action) => {
    setMaterialForApproval(material);
    setApprovalAction(action);
    setRejectionReason(''); // Reset rejection reason for new action
    setOpenApprovalDialog(true);
  };

  const confirmApprovalAction = async () => {
    if (materialForApproval) {
      const status = approvalAction === 'approve' ? 'approved' : 'rejected';
      await handleApprovalStatusChange(
        materialForApproval._id, 
        status, 
        rejectionReason
      );
      
      // Close all dialogs and reset state
      setOpenApprovalDialog(false);
      setOpenViewDialog(false);
      setOpenDialog(false);
      setMaterialForApproval(null);
      setApprovalAction('');
      setRejectionReason('');
      setSelectedMaterial(null);
    }
  };

  const getApprovalStatus = (status) => {
    switch (status) {
      case 'approved':
        return { label: 'APPROVED', color: 'success', icon: <ApproveIcon /> };
      case 'rejected':
        return { label: 'REJECTED', color: 'error', icon: <RejectIcon /> };
      case 'pending':
      default:
        return { label: 'PENDING', color: 'warning', icon: <PendingIcon /> };
    }
  };

  const handleSubmit = async () => {
    try {
      setDialogError(''); // Clear any previous dialog errors
      
      // Validation for required fields
      if (!formData.name.trim()) {
        setError('Material name is required');
        return;
      }

      // Check for duplicate material name and description
      const duplicateMaterial = materials.find(material => {
        // Skip checking against the same material when editing
        if (selectedMaterial && material._id === selectedMaterial._id) {
          return false;
        }
        return material.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
               material.description?.toLowerCase().trim() === formData.description?.toLowerCase().trim();
      });

      if (duplicateMaterial) {
        const errorMessage = 'A material with the same name and description already exists';
        setDialogError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (!formData.category) {
        setError('Category is required');
        return;
      }
      if (!formData.unit) {
        setError('Unit is required');
        return;
      }
      if (!formData.supplierName.trim()) {
        setError('Supplier name is required');
        return;
      }
      if (formData.quantityAvailable < 0) {
        setError('Quantity cannot be negative');
        return;
      }
      if (formData.unitPrice <= 0) {
        setError('Unit price must be greater than 0');
        return;
      }
      if (formData.minStockLevel < 0) {
        setError('Minimum stock level cannot be negative');
        return;
      }
      if (formData.maxStockLevel <= formData.minStockLevel) {
        setError('Maximum stock level must be greater than minimum stock level');
        return;
      }

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subCategory: formData.subCategory.trim(),
        unit: formData.unit,
        quantityAvailable: parseInt(formData.quantityAvailable) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 0,
        maxStockLevel: parseInt(formData.maxStockLevel) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        supplier: {
          name: formData.supplierName.trim(),
          contact: formData.supplierContact.trim(),
          email: formData.supplierEmail.trim(),
          address: formData.supplierAddress.trim(),
        },
        location: {
          warehouse: formData.warehouse.trim(),
          rack: formData.rack.trim(),
          bin: formData.bin.trim(),
        },
        qualityGrade: formData.qualityGrade,
        expiryDate: formData.expiryDate || null,
        specifications: formData.specifications,
        // Set approval status based on user role
        approvalStatus: user?.role === 'admin' ? 'approved' : 'pending',
      };

      if (selectedMaterial) {
        await apiService.updateMaterial(selectedMaterial._id, submitData);
        setError('');
      } else {
        await apiService.createMaterial(submitData);
        setError('');
        
        // Show appropriate success message based on user role
        if (user?.role === 'admin') {
          toast.success('Material created and approved successfully');
        } else {
          toast.success('Material created successfully. Pending admin approval.');
        }
      }
      
      await fetchMaterials();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving material:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || error.message || 'Failed to save material');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Export materials to CSV
  const handleExportMaterials = () => {
    try {
      // Define CSV headers
      const headers = [
        'Serial Number',
        'Material Name',
        'Description',
        'Category',
        'Sub Category',
        'Unit',
        'Quantity Available',
        'Min Stock Level',
        'Max Stock Level',
        'Unit Price (₹)',
        'Total Value (₹)',
        'Supplier Name',
        'Supplier Contact',
        'Supplier Email',
        'Supplier Address',
        'Warehouse',
        'Rack',
        'Bin',
        'Stock Status',
        'Created Date',
        'Last Updated'
      ];

      // Convert materials data to CSV rows
      const csvData = filteredMaterials.map(material => [
        material.serialNumber || 'N/A',
        material.name || 'N/A',
        material.description || 'N/A',
        material.category || 'N/A',
        material.subCategory || 'N/A',
        material.unit || 'N/A',
        material.quantityAvailable || 0,
        material.minStockLevel || 0,
        material.maxStockLevel || 0,
        material.unitPrice || 0,
        (material.quantityAvailable * material.unitPrice) || 0,
        material.supplier?.name || 'N/A',
        material.supplier?.contact || 'N/A',
        material.supplier?.email || 'N/A',
        material.supplier?.address || 'N/A',
        material.location?.warehouse || 'N/A',
        material.location?.rack || 'N/A',
        material.location?.bin || 'N/A',
        getStockStatus(material).label || 'N/A',
        material.createdAt ? new Date(material.createdAt).toLocaleDateString() : 'N/A',
        material.updatedAt ? new Date(material.updatedAt).toLocaleDateString() : 'N/A'
      ]);

      // Combine headers and data
      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `materials_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success(`Successfully exported ${filteredMaterials.length} materials to CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export materials');
    }
  };

  const getStockStatus = (material) => {
    if (material.quantityAvailable <= material.minStockLevel) {
      return { label: 'Low Stock', color: 'error' };
    }
    if (material.quantityAvailable <= material.minStockLevel * 2) {
      return { label: 'Medium Stock', color: 'warning' };
    }
    return { label: 'Good Stock', color: 'success' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Materials Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage inventory, track stock levels, and monitor material usage
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportMaterials}
            size="large"
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddMaterial}
            size="large"
          >
            Add Material
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search materials by name, description, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {materials.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No. of Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {materials.filter(m => m.quantityAvailable <= m.minStockLevel).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Low Stock Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {materials.reduce((sum, m) => sum + (m.quantityAvailable * m.unitPrice), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {new Set(materials.map(m => m.category)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Materials Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Serial Number</TableCell>
                  <TableCell>Material Name</TableCell>
                  <TableCell>Quantity Available</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Stock Status</TableCell>
                  <TableCell>Approval Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMaterials.map((material) => {
                  const stockStatus = getStockStatus(material);
                  return (
                    <TableRow key={material._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {material.serialNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {material.name}
                        </Typography>
                        {material.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {material.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight={600}>
                            {material.quantityAvailable} {material.unit}
                          </Typography>
                          {material.quantityAvailable <= material.minStockLevel && (
                            <Chip
                              label="LOW"
                              size="small"
                              color="error"
                              sx={{ fontSize: '0.6rem', height: '18px' }}
                            />
                          )}
                          {material.quantityAvailable <= material.minStockLevel * 2 && material.quantityAvailable > material.minStockLevel && (
                            <Chip
                              label="MEDIUM"
                              size="small"
                              color="warning"
                              sx={{ fontSize: '0.6rem', height: '18px' }}
                            />
                          )}
                          {material.quantityAvailable > material.minStockLevel * 2 && (
                            <Chip
                              label="GOOD"
                              size="small"
                              color="success"
                              sx={{ fontSize: '0.6rem', height: '18px' }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Min: {material.minStockLevel} | Max: {material.maxStockLevel}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          ₹{material.unitPrice.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Total: ₹{(material.quantityAvailable * material.unitPrice).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {material.supplier?.name || 'N/A'}
                        </Typography>
                        {material.supplier?.contact && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            📞 {material.supplier.contact}
                          </Typography>
                        )}
                        {material.supplier?.email && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            ✉️ {material.supplier.email}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {material.location?.warehouse || 'N/A'}
                        </Typography>
                        {(material.location?.rack || material.location?.bin) && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {material.location.rack && `Rack: ${material.location.rack}`}
                            {material.location.rack && material.location.bin && ' | '}
                            {material.location.bin && `Bin: ${material.location.bin}`}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stockStatus.label}
                          color={stockStatus.color}
                          size="small"
                          icon={stockStatus.color === 'error' ? <WarningIcon /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const approvalStatus = getApprovalStatus(material.approvalStatus);
                          return (
                            <Chip
                              label={approvalStatus.label}
                              color={approvalStatus.color}
                              size="small"
                            />
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <IconButton size="small" onClick={() => handleViewMaterial(material)}>
                            <ViewIcon />
                          </IconButton>
                          {(user?.role === 'admin' || material.approvalStatus === 'approved') && (
                            <IconButton size="small" onClick={() => handleEditMaterial(material)}>
                              <EditIcon />
                            </IconButton>
                          )}
                          {user?.role === 'admin' && (
                            <IconButton size="small" color="error" onClick={() => handleDeleteMaterial(material)}>
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Material Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedMaterial ? 'Edit Material' : 'Add New Material'}
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Material Name *"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? 'Required field' : ''}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category *"
                select
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                required
                error={!formData.category}
                helperText={!formData.category ? 'Required field' : ''}
              >
                <MenuItem value="">Select Category</MenuItem>
                <MenuItem value="Electronic Components">Electronic Components</MenuItem>
                <MenuItem value="Mechanical Parts">Mechanical Parts</MenuItem>
                <MenuItem value="Raw Materials">Raw Materials</MenuItem>
                <MenuItem value="Packaging Materials">Packaging Materials</MenuItem>
                <MenuItem value="Tools & Equipment">Tools & Equipment</MenuItem>
                <MenuItem value="Testing Equipment">Testing Equipment</MenuItem>
                <MenuItem value="Consumables">Consumables</MenuItem>
                <MenuItem value="Hardware">Hardware</MenuItem>
                <MenuItem value="Software Components">Software Components</MenuItem>
                <MenuItem value="Safety Equipment">Safety Equipment</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sub Category"
                value={formData.subCategory}
                onChange={(e) => handleFormChange('subCategory', e.target.value)}
                helperText="Optional field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quality Grade"
                select
                value={formData.qualityGrade}
                onChange={(e) => handleFormChange('qualityGrade', e.target.value)}
                helperText="Optional (defaults to Grade A)"
              >
                <MenuItem value="A">Grade A</MenuItem>
                <MenuItem value="B">Grade B</MenuItem>
                <MenuItem value="C">Grade C</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={3}
                helperText="Optional - Detailed description of the material"
              />
            </Grid>

            {/* Inventory Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Inventory Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Unit *"
                select
                value={formData.unit}
                onChange={(e) => handleFormChange('unit', e.target.value)}
                required
                error={!formData.unit}
                helperText={!formData.unit ? 'Required field' : ''}
              >
                <MenuItem value="">Select Unit</MenuItem>
                <MenuItem value="pcs">Pieces</MenuItem>
                <MenuItem value="kg">Kilograms</MenuItem>
                <MenuItem value="gm">Grams</MenuItem>
                <MenuItem value="ltr">Liters</MenuItem>
                <MenuItem value="ml">Milliliters</MenuItem>
                <MenuItem value="mt">Meters</MenuItem>
                <MenuItem value="ft">Feet</MenuItem>
                <MenuItem value="mt2">Square Meters</MenuItem>
                <MenuItem value="set">Set</MenuItem>
                <MenuItem value="box">Box</MenuItem>
                <MenuItem value="roll">Roll</MenuItem>
                <MenuItem value="sheet">Sheet</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Current Quantity *"
                type="number"
                value={formData.quantityAvailable}
                onChange={(e) => handleFormChange('quantityAvailable', e.target.value)}
                required
                inputProps={{ min: 0 }}
                error={formData.quantityAvailable < 0}
                helperText={formData.quantityAvailable < 0 ? 'Must be 0 or greater' : 'Required field'}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Unit Price (₹) *"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => handleFormChange('unitPrice', e.target.value)}
                required
                inputProps={{ min: 0, step: 0.01 }}
                error={formData.unitPrice <= 0}
                helperText={formData.unitPrice <= 0 ? 'Must be greater than 0' : 'Required field'}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Stock Level *"
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => handleFormChange('minStockLevel', e.target.value)}
                required
                inputProps={{ min: 0 }}
                error={formData.minStockLevel < 0}
                helperText={formData.minStockLevel < 0 ? 'Must be 0 or greater' : 'Required field'}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Stock Level *"
                type="number"
                value={formData.maxStockLevel}
                onChange={(e) => handleFormChange('maxStockLevel', e.target.value)}
                required
                inputProps={{ min: 0 }}
                error={formData.maxStockLevel <= formData.minStockLevel}
                helperText={formData.maxStockLevel <= formData.minStockLevel ? 'Must be greater than minimum' : 'Required field'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Optional - Leave blank if no expiry date"
              />
            </Grid>

            {/* Supplier Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Supplier Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Name *"
                value={formData.supplierName}
                onChange={(e) => handleFormChange('supplierName', e.target.value)}
                required
                error={!formData.supplierName.trim()}
                helperText={!formData.supplierName.trim() ? 'Required field' : ''}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Contact"
                value={formData.supplierContact}
                onChange={(e) => handleFormChange('supplierContact', e.target.value)}
                helperText="Optional - Phone number or contact person"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Email"
                type="email"
                value={formData.supplierEmail}
                onChange={(e) => handleFormChange('supplierEmail', e.target.value)}
                helperText="Optional - Email address for orders"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Address"
                value={formData.supplierAddress}
                onChange={(e) => handleFormChange('supplierAddress', e.target.value)}
                multiline
                rows={2}
                helperText="Optional - Full address of supplier"
              />
            </Grid>

            {/* Location Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Storage Location (Optional)
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Warehouse"
                value={formData.warehouse}
                onChange={(e) => handleFormChange('warehouse', e.target.value)}
                helperText="Optional - Warehouse identifier"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Rack"
                value={formData.rack}
                onChange={(e) => handleFormChange('rack', e.target.value)}
                helperText="Optional - Rack number"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bin"
                value={formData.bin}
                onChange={(e) => handleFormChange('bin', e.target.value)}
                helperText="Optional - Bin location"
              />
            </Grid>

            {/* Show rejection reason to all users if material was rejected */}
            {selectedMaterial && selectedMaterial.approvalStatus === 'rejected' && selectedMaterial.rejectionReason && (
              <>
                <Grid item xs={12}>
                  <Alert severity="error" icon={<CloseIcon />} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="error" gutterBottom>
                      ⚠️ Material Rejected
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(211, 47, 47, 0.05)', borderRadius: 1, border: '1px solid rgba(211, 47, 47, 0.2)' }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Rejection Reason:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                        "{selectedMaterial.rejectionReason}"
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                        {selectedMaterial.approvedBy && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Rejected by
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {selectedMaterial.approvedBy?.name || selectedMaterial.approvedBy}
                            </Typography>
                          </Box>
                        )}
                        {selectedMaterial.approvedAt && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Date & Time
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {new Date(selectedMaterial.approvedAt).toLocaleString('en-IN', { 
                                dateStyle: 'medium', 
                                timeStyle: 'short' 
                              })}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Alert>
                </Grid>
              </>
            )}

            {/* Admin Approval Control - Simple Buttons Only */}
            {user?.role === 'admin' && selectedMaterial && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                    Approval Management
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Current Status: <strong>{selectedMaterial.approvalStatus || 'pending'}</strong>
                  </Typography>
                  
                  {/* Simple Approval Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprovalAction(selectedMaterial, 'approve')}
                      disabled={selectedMaterial.approvalStatus === 'approved'}
                    >
                      Approve This Material
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleApprovalAction(selectedMaterial, 'reject')}
                      disabled={selectedMaterial.approvalStatus === 'rejected'}
                    >
                      Reject This Material
                    </Button>
                  </Box>
                  
                  {selectedMaterial.rejectionReason && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      <strong>Rejection Reason:</strong> {selectedMaterial.rejectionReason}
                    </Typography>
                  )}
                </Grid>
              </>
            )}

            {/* Old approval section - keeping for reference */}
            {/* Approval Status Section (only for admins editing existing materials) */}
            {/* Temporarily showing for all users to debug */}
            {false && selectedMaterial && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                    🔍 Approval Status (Debug Mode - User: {user?.role || 'unknown'})
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Current Status</Typography>
                  <Chip 
                    label={selectedMaterial.approvalStatus?.toUpperCase() || 'PENDING'}
                    color={getApprovalStatus(selectedMaterial.approvalStatus).color}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                
                {selectedMaterial.approvedBy && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {selectedMaterial.approvalStatus === 'approved' ? 'Approved By' : 'Reviewed By'}
                    </Typography>
                    <Typography variant="body1">{selectedMaterial.approvedBy}</Typography>
                  </Grid>
                )}
                
                {selectedMaterial.approvedAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {selectedMaterial.approvalStatus === 'approved' ? 'Approved Date' : 'Review Date'}
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedMaterial.approvedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
                
                {selectedMaterial.rejectionReason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="error">Rejection Reason</Typography>
                    <Typography variant="body1" color="error">
                      {selectedMaterial.rejectionReason}
                    </Typography>
                  </Grid>
                )}
                
                {/* Approval Actions for Pending Materials */}
                {selectedMaterial.approvalStatus === 'pending' && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Debug Info: Material status is "{selectedMaterial.approvalStatus}", User role is "{user?.role}"
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={() => handleApprovalAction(selectedMaterial, 'approve')}
                      >
                        Approve Material
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => handleApprovalAction(selectedMaterial, 'reject')}
                      >
                        Reject Material
                      </Button>
                    </Box>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedMaterial ? 'Update' : 'Add'} Material
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Material Dialog (Read-only) */}
      <Dialog open={openViewDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          Material Details - {selectedMaterial?.name}
        </DialogTitle>
        <DialogContent>
          {selectedMaterial && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Serial Number</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedMaterial.serialNumber}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Material Name</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedMaterial.name}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                <Chip label={selectedMaterial.category} variant="outlined" />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Sub Category</Typography>
                <Typography variant="body1">{selectedMaterial.subCategory || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Quality Grade</Typography>
                <Chip label={`Grade ${selectedMaterial.qualityGrade}`} color="success" size="small" />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                <Typography variant="body1">
                  {selectedMaterial.expiryDate ? new Date(selectedMaterial.expiryDate).toLocaleDateString() : 'No Expiry'}
                </Typography>
              </Grid>
              
              {selectedMaterial.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedMaterial.description}</Typography>
                </Grid>
              )}

              {/* Inventory Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Inventory Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Unit</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedMaterial.unit}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Current Quantity</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedMaterial.quantityAvailable} {selectedMaterial.unit}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Unit Price</Typography>
                <Typography variant="body1" fontWeight={600}>
                  ₹{selectedMaterial.unitPrice?.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Total Value</Typography>
                <Typography variant="body1" fontWeight={600}>
                  ₹{((selectedMaterial.quantityAvailable || 0) * (selectedMaterial.unitPrice || 0)).toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Stock Levels</Typography>
                <Typography variant="body1">
                  Min: {selectedMaterial.minStockLevel} | Max: {selectedMaterial.maxStockLevel}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Stock Status</Typography>
                <Chip 
                  label={getStockStatus(selectedMaterial).label} 
                  color={getStockStatus(selectedMaterial).color}
                  icon={getStockStatus(selectedMaterial).color === 'error' ? <WarningIcon /> : undefined}
                />
              </Grid>

              {/* Supplier Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Supplier Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Supplier Name</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedMaterial.supplier?.name}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                <Typography variant="body1">{selectedMaterial.supplier?.contact || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedMaterial.supplier?.email || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography variant="body1">{selectedMaterial.supplier?.address || 'N/A'}</Typography>
              </Grid>

              {/* Location Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Storage Location
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Warehouse</Typography>
                <Typography variant="body1">{selectedMaterial.location?.warehouse || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Rack</Typography>
                <Typography variant="body1">{selectedMaterial.location?.rack || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Bin</Typography>
                <Typography variant="body1">{selectedMaterial.location?.bin || 'N/A'}</Typography>
              </Grid>

              {/* Approval Status Section (only for admins) */}
              {user?.role === 'admin' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                      Approval Status
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Current Status</Typography>
                    <Chip 
                      label={selectedMaterial.approvalStatus?.toUpperCase() || 'PENDING'}
                      color={getApprovalStatus(selectedMaterial.approvalStatus).color}
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  
                  {selectedMaterial.approvedBy && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {selectedMaterial.approvalStatus === 'approved' ? 'Approved By' : 'Reviewed By'}
                      </Typography>
                      <Typography variant="body1">{selectedMaterial.approvedBy}</Typography>
                    </Grid>
                  )}
                  
                  {selectedMaterial.approvedAt && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {selectedMaterial.approvalStatus === 'approved' ? 'Approved Date' : 'Review Date'}
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedMaterial.approvedAt).toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                  
                  {selectedMaterial.rejectionReason && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="error">Rejection Reason</Typography>
                      <Typography variant="body1" color="error">
                        {selectedMaterial.rejectionReason}
                      </Typography>
                    </Grid>
                  )}
                  
                  {/* Approval Actions for Pending Materials */}
                  {selectedMaterial.approvalStatus === 'pending' && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={() => handleApprovalAction(selectedMaterial, 'approve')}
                        >
                          Approve Material
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<CloseIcon />}
                          onClick={() => handleApprovalAction(selectedMaterial, 'reject')}
                        >
                          Reject Material
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </>
              )}

              {/* Timestamps */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Record Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Created Date</Typography>
                <Typography variant="body1">
                  {selectedMaterial.createdAt ? new Date(selectedMaterial.createdAt).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                <Typography variant="body1">
                  {selectedMaterial.updatedAt ? new Date(selectedMaterial.updatedAt).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>

              {/* Show rejection reason to all users if material was rejected */}
              {selectedMaterial.approvalStatus === 'rejected' && selectedMaterial.rejectionReason && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" color="error" gutterBottom sx={{ mt: 2 }}>
                      Rejection Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(211, 47, 47, 0.05)', 
                      borderRadius: 1, 
                      border: '1px solid rgba(211, 47, 47, 0.2)' 
                    }}>
                      <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                        <strong>Rejection Reason:</strong> {selectedMaterial.rejectionReason}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {selectedMaterial.approvedBy && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Rejected By:</strong> {selectedMaterial.approvedBy?.name || selectedMaterial.approvedBy}
                          </Typography>
                        )}
                        {selectedMaterial.approvedAt && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Date:</strong> {new Date(selectedMaterial.approvedAt).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button variant="contained" onClick={() => {
            setOpenViewDialog(false);
            handleEditMaterial(selectedMaterial);
          }}>
            Edit Material
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the material "{materialToDelete?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. The material will be permanently removed from the system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={openApprovalDialog} onClose={() => setOpenApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {approvalAction === 'approve' ? 'Approve Material' : 'Reject Material'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to {approvalAction} the material "{materialForApproval?.name}"?
          </Typography>
          
          {/* Show rejection reason field for reject action */}
          {approvalAction === 'reject' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Please provide a reason for rejection:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Rejection Reason *"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejecting this material..."
                required
                error={!rejectionReason.trim()}
                helperText={!rejectionReason.trim() ? 'Rejection reason is required' : ''}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Box>
          )}
          
          {/* Show information for approve action */}
          {approvalAction === 'approve' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Approved materials will be available for use in the system.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenApprovalDialog(false);
            setRejectionReason('');
            setApprovalAction('');
            setMaterialForApproval(null);
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color={approvalAction === 'approve' ? 'success' : 'error'} 
            onClick={confirmApprovalAction}
            disabled={approvalAction === 'reject' && !rejectionReason.trim()}
          >
            {approvalAction === 'approve' ? 'Approve' : 'Reject'} Material
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialManagement;
