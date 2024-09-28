import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name of the subcategory
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Reference to the parent category
    createdAt: { type: Date, default: Date.now }, // Timestamp for when the subcategory was created
    updatedAt: { type: Date, default: Date.now }  // Timestamp for when the subcategory was last updated
});

// Pre-save hook to set timestamps
subcategorySchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdAt = new Date();
    }
    this.updatedAt = new Date();
    next();
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

export default Subcategory;
