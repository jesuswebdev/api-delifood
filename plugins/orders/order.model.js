'use strict';

module.exports = (mongoose) => {

    let productSubschema = new mongoose.Schema({
        
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        },
        unitPrice: Number,
        quantity: Number,
        totalPrice: Number
    }, { _id: false });//_id false para que no cree un nuevo id cuando guarde
    
    let OrderSchema = new mongoose.Schema({

        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        products: [productSubschema],
        created: {
            type: Date,
            default: Date.now
        },
        totalPayment: {
            type: Number
        },
        paymentProcessor: {
            type: String,
            enum: ['paypal', 'stripe']
        },
        paymentId: {
            type: String
        }
    });

    OrderSchema.set('toJSON', {
        getters: true,
        virtuals: true
    });

    return mongoose.model('Order', OrderSchema);
};
