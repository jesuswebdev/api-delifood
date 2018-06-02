'use strict';

module.exports = (mongoose) => {
    
    const ProductSchema = new mongoose.Schema({

        name: {
            type: String,
            unique: true,
            required: true
        },
        description: {
            type: String
        },
        slug: {
            type: String,
            unique: true
        },
        category: {
            type: mongoose.Schema.ObjectId,
            ref: 'Category',
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        visible: {
            type: Boolean,
            default: true
        },
        timesSold: {
            type: Number,
            default: 0
        },
        totalQuantitySold: {
            type: Number,
            default: 0
        },
        created: {
            type: Date,
            default: Date.now()
        },
        img: {
            type: String
        }
    });

    ProductSchema.set('toJSON',{
        getters: true,
        virtuals: true
    });

    ProductSchema.pre('save', async function() {
        
        this.slug = createSlug(this.name);
    });

    const createSlug = (string) => {

        return string.toLowerCase().replace(/\s/gi, '-');
    };

    return mongoose.model('Product', ProductSchema);
};
