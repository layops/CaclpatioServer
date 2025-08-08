const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Material name is required'],
        trim: true,
        maxlength: [50, 'Material name cannot exceed 50 characters']
    },
    count: {
        type: Number,
        required: [true, 'Material count is required'],
        min: [0, 'Count cannot be negative'],
        default: 0
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [15, 'Username cannot exceed 15 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        maxlength: [255, 'Password cannot exceed 255 characters'],
        select: false
    },
    nameSurname: {
        type: String,
        required: [true, 'Name and surname are required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters'],
        maxlength: [30, 'Name cannot exceed 30 characters']
    },
    stock: {
        type: [materialSchema],
        default: [],
        validate: {
            validator: function (stock) {
                const names = stock.map(item => item.name.toLowerCase());
                return new Set(names).size === names.length;
            },
            message: 'Stock items must have unique names'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Tek index tanımı (unique + case-insensitive)
userSchema.index({ username: 1 }, {
    unique: true,
    collation: { locale: 'en', strength: 2 }
});

module.exports = mongoose.model('User', userSchema);