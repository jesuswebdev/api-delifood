const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const saltFactor = 10;

const UserSchema = new Schema({
    banned: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        minlength: 6,
        required: true
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'user', 'owner'],
        default: 'user'
    }
});

UserSchema.pre('save', function(){
    if(this.password){
        this.hashPassword(this);
    }
});

UserSchema.methods.hashPassword = async (user) => {
    try{
        user.password = await bcrypt.hash(user.password, saltFactor);
        console.log(user.password);
    }
    catch(e){
        return e;
    }
};


UserSchema.set('toJSON',{
	getters: true,
	virtuals: true
});

mongoose.model('User', UserSchema);
