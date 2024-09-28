import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name of the category
    createdAt: { type: Date, default: Date.now }, // Timestamp for when the category was created
    updatedAt: { type: Date, default: Date.now }  // Timestamp for when the category was last updated
});

categorySchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdAt = new Date();
    }
    this.updatedAt = new Date();
    next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
