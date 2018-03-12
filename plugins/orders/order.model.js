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
        status: {
            type: String,
            enum: ['Pendiente', 'Aprobado', 'Rechazado'],
            default: 'Pendiente'
        },
        created: {
            type: Date,
            default: Date.now
        },
        approved: {
            type: Date
        },
        totalPayment: {
            type: Number
        }
    });

    OrderSchema.set('toJSON', {
        getters: true,
        virtuals: true
    });

    mongoose.model('Order', OrderSchema);
};