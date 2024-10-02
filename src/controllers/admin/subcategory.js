import mongoose from 'mongoose';
import SubCategory from '../../models/subcategory.js';

class SubCategoryAdmin {
    // Create a new SubCategory
    static createSubCategory = async (req, res) => {
        try {
            const newSubCategory = new SubCategory(req.body);
            await newSubCategory.save();
            res.status(201).json(newSubCategory);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Update an existing SubCategory
    static updateSubCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            const updatedSubCategory = await SubCategory.findByIdAndUpdate(id, updates, {
                new: true,
                runValidators: true,
            }).exec();

            if (!updatedSubCategory) {
                return res.status(404).json({ error: 'SubCategory not found' });
            }

            res.status(200).json(updatedSubCategory);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Delete a SubCategory
    static deleteSubCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

            if (!deletedSubCategory) {
                return res.status(404).json({ error: 'SubCategory not found' });
            }

            res.status(200).json({ message: 'SubCategory deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Get a single SubCategory
    static getSubCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const subCategory = await SubCategory.findById(id);

            if (!subCategory) {
                return res.status(404).json({ error: 'SubCategory not found' });
            }

            res.status(200).json(subCategory);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Get all SubCategories
    static getAllSubCategories = async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const subCategories = await SubCategory.find()
                .populate('category_id') // Populate category data
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .exec();
    
            const totalSubCategories = await SubCategory.countDocuments();
            res.status(200).json({
                totalSubCategories,
                totalPages: Math.ceil(totalSubCategories / limit),
                currentPage: page,
                subCategories,
            });
        } catch (error) {
            res.status(500).json({ error: 'Error fetching subcategories' });
        }
    };

    // Get SubCategories by Category ID
    static getSubCategoriesByCategoryId = async (req, res) => {
        try {
            const { categoryId } = req.params;
            const subCategories = await SubCategory.find({ category_id: categoryId })
                .populate('category_id'); // Populate category data

            if (subCategories.length === 0) {
                return res.status(404).json({ error: 'No SubCategories found for this Category ID' });
            }

            res.status(200).json(subCategories);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}

export default SubCategoryAdmin;
