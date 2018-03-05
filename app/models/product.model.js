var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ProductSchema = new Schema({
	name : {
		type : String,
		trim: true,
		required: true
	},
	category: {
		type: Schema.ObjectId,
		ref: 'Category'
	},
	description: String,
	totalTimesOrdered: {
		type: Number,
		default: 0
	},
	totalQtyOrdered: {
		type: Number,
		default: 0
	},
	price: Number,
	visible: {
		type: Boolean,
		default: true
	}
});

ProductSchema.set('toJSON',{
	getters: true,
	virtuals: true
});

mongoose.model('Product', ProductSchema);
