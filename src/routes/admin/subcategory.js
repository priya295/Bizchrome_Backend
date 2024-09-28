import express from 'express';
import SubCategoryAdmin from '../../controllers/admin/subcategory.js';

const router = express.Router();

// Subcategory routes
router.get('/subcategories', SubCategoryAdmin.getAllSubCategories); // Get all subcategories with pagination
router.get('/subcategories/:id', SubCategoryAdmin.getSubCategory); // Get a single subcategory by ID
router.post('/subcategories', SubCategoryAdmin.createSubCategory); // Create a new subcategory
router.put('/subcategories/:id', SubCategoryAdmin.updateSubCategory); // Update an existing subcategory
router.delete('/subcategories/:id', SubCategoryAdmin.deleteSubCategory); // Delete a subcategory
router.get('/subcategories/category/:categoryId', SubCategoryAdmin.getSubCategoriesByCategoryId);

export default router;
