var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var CategorySchema = new Schema({
	name : {
		type : String,
		trim: true,
		required: true
	},
	description: String,
	productCount: {
		type: Number,
		default: 0,
		min: 0
	},
	visible: {
		type: Boolean,
		default: true
	},
	img: {
		url: {
			type: String
		},
		mimetype: {
			type: String
		}
	}
});

CategorySchema.set('toJSON',{
	getters: true,
	virtuals: true
});

mongoose.model('Category', CategorySchema);