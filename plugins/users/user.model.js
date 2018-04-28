'use strict';

const Bcrypt = require('bcrypt');
const saltFactor = 10;

module.exports = (mongoose) => {

    const UserSchema = new mongoose.Schema({

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
        },
        created: {
            type: Date,
            default: Date.now()
        }
    });
        
    UserSchema.pre('save', async function(){
        
        await this.hashPassword(this);
    });
    
    UserSchema.methods.hashPassword = async (user) => {
        
        try {
            user.password = await Bcrypt.hash(user.password, saltFactor);
        }
        catch (error) {
            return error;
        }
    };
    
    UserSchema.methods.validatePassword = async (loginAttemptPassword, userPassword) => {
        
        return await Bcrypt.compare(loginAttemptPassword, userPassword);
    };

    UserSchema.set('toJSON',{
        getters: true,
        virtuals: true
    });

    return mongoose.model('User', UserSchema);
};
