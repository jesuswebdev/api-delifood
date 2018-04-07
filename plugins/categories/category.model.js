'use strict';

module.exports = (mongoose) => {

    const CategorySchema = new mongoose.Schema({
        
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        slug: {
            type: String,
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

    CategorySchema.pre('save', async function() {
        
        this.slug = createSlug(this.name);
    });

    const createSlug = (string) => {

        return string.toLowerCase().replace(/\s/gi, '-');
    };

    return mongoose.model('Category', CategorySchema);
};
