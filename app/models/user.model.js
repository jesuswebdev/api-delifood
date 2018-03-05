var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var saltFactor = 10;

var UserSchema = new Schema({
	banned: {
		type: Boolean,
		default: false
	},
	name : {
		type : String,
		trim: true,
		required: true
	},
	email : {
			type : String,
			index : true,
			unique : true,
			match: [/.+\@.+\..+/, 'Direccion de correo electronico no valida']
	},
	password : {
			type : String,
			bcryt : true,
			validate: [
			function(password){
				return password && password.length > 6;
			}, 'La contraseña debe contener mas de 6 caracteres'
			]
	},
	address : String,
	phone : {
		type : String
	},
	created : {
		type : Date,
		default: Date.now()
	},
	role : {
		type : String,
		required: true,
		enum: ['admin', 'owner', 'user'],
		default: 'user'
	},
	facebook: {
		email: {
			type: String
		}
	},
	google: {
		email: {
			type: String
		}
	}
});

UserSchema.pre('save', function(next){
	if(this.password){
		this.hashPassword(this, next);
	}
});

UserSchema.methods.hashPassword = function(user, next){
	bcrypt.hash(user.password, saltFactor, function(err, hash){
		if(err){ return next(err); }
		user.password = hash;
		next();
	});
};

UserSchema.methods.validPassword = function(password, cb){
	bcrypt.compare(password, this.password, function(err, same){
		if(err){ return err; }
		cb(same);
	});
};

UserSchema.set('toJSON',{
	getters: true,
	virtuals: true
});

mongoose.model('User', UserSchema);
