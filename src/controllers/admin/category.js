import mongoose from 'mongoose';
import Category from '../../models/category.js';

class CategoryAdmin {
    // Create a new Category
    static createCategory = async (req, res) => {
        try {
            const newCategory = new Category(req.body);
            await newCategory.save();
            res.status(201).json(newCategory);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Update an existing Category
    static updateCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            const updatedCategory = await Category.findByIdAndUpdate(id, updates, {
                new: true,
                runValidators: true,
            }).exec();

            if (!updatedCategory) {
                return res.status(404).json({ error: 'Category not found' });
            }

            res.status(200).json(updatedCategory);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Delete a Category
    static deleteCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const deletedCategory = await Category.findByIdAndDelete(id);

            if (!deletedCategory) {
                return res.status(404).json({ error: 'Category not found' });
            }

            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Get a single Category
    static getCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            res.status(200).json(category);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Get all Categories
    static getAllCategories = async (req, res) => {
        try {
            const categories = await Category.find().exec();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching categories' });
        }
    };
}

export default CategoryAdmin;
