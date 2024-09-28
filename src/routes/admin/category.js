import express from 'express';
import CategoryAdmin from '../../controllers/admin/category.js';

const router = express.Router();

// Category routes
router.get('/categories', CategoryAdmin.getAllCategories); // Get all categories with pagination
router.get('/categories/:id', CategoryAdmin.getCategory); // Get a single category by ID
router.post('/categories', CategoryAdmin.createCategory); // Create a new category
router.put('/categories/:id', CategoryAdmin.updateCategory); // Update an existing category
router.delete('/categories/:id', CategoryAdmin.deleteCategory); // Delete a category

export default router;
