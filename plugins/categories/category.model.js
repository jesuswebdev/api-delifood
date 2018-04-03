'use strict';

module.exports = (mongoose) => {

    const CategorySchema = new mongoose.Schema({
        
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        description: {
            type: String,
            default: null
        },
        productsCount: {
            type: Number,
            default: 0,
            min: 0
        },
        img: {
            type: String
        }
    });

    CategorySchema.set('toJSON',{
        getters: true,
        virtuals: true
    });

    return mongoose.model('Category', CategorySchema);
};
