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
        totalTimesOrdered: {
            type: Number,
            default: 0
        },
        totalSold: {
            type: Number,
            default: 0
        },
        created: {
            type: Date,
            default: Date.now()
        },
        picture: {
            path: {
                type: String
            },
            contentType: {
                type: String
            },
            bytes: {
                type: Number
            }
        }
    });

    ProductSchema.set('toJSON',{
        getters: true,
        virtuals: true
    });

    return mongoose.model('Product', ProductSchema);
};