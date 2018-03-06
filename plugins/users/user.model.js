const bcrypt = require('bcrypt');
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
        }
    });
    
    UserSchema.pre('save', async function(){
        await this.hashPassword(this);
    });
    
    UserSchema.methods.hashPassword = async (user) => {
        try{
            user.password = await bcrypt.hash(user.password, saltFactor);
        }
        catch(e){
            return e;
        }
    };

    UserSchema.methods.validatePassword = async (loginAttemptPassword, userPassword) => {
        return await bcrypt.compare(loginAttemptPassword, userPassword);
    }
    
    
    UserSchema.set('toJSON',{
        getters: true,
        virtuals: true
    });
    
    mongoose.model('User', UserSchema);

};//module.exports
