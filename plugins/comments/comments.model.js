'use strict'

module.exports = (mongoose) => {

    const commentSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
        product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: true },
        text: { type: String, required: true },
        rating: { type: Number, min: 0, max: 5 },
        createdAt: { type: Date, default: Date.now }
    });

    return mongoose.model('Comment', commentSchema);
}
