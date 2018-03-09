module.exports = (mongoose) => {
    const CategorySchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            required: true
        },
        description: {
            type: String
        },
        productsCount: {
            type: Number,
            default: 0,
            min: 0
        },
        img: {
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

    CategorySchema.set('toJSON',{
        getters: true,
        virtuals: true
    });

    mongoose.model('Category', CategorySchema);
};