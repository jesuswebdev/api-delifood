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
            path: {
                type: String,
                default: null
            },
            contentType: {
                type: String,
                default: null
            },
            bytes: {
                type: Number,
                default: 0
            }
        }
    });

    CategorySchema.set('toJSON',{
        getters: true,
        virtuals: true
    });

    mongoose.model('Category', CategorySchema);
};