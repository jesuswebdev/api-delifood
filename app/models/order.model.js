var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var OrderSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	products: [
		{
			product: {
				type: Schema.ObjectId,
				ref: 'Product'
			},
			quantity: Number
		}
	],
	status: {
		type: String,
		enum: ['Pendiente', 'Aprobado', 'Negado'],
		default: 'Pendiente'
	},
	shippingAddress: String,
	created: {
		type: Date,
		default: Date.now()
	},
	approved: Date,
	total: Number
});

OrderSchema.pre('save', function(next){
	//ciclo por todos los productos para solo asignar el id
	next();
});

OrderSchema.set('toJSON',{
	getters: true,
	virtuals: true
});

mongoose.model('Order', OrderSchema);