const cfg = require('../../config/config');
const boom = require('boom');
const jwt = require('jsonwebtoken');


exports.create = async (req, h) => {

    let User = req.server.plugins.database.mongoose.model('User');

    let newUser = new User(req.payload);

    try{
        var registeredUser = await newUser.save();
    }catch(error){//manejar error 11000 correo en uso
        if(error.code == 11000){ return boom.conflict('Correo electrónico en uso'); }
        return boom.internal('Error al registrar el usuario');
    }

    return { statusCode: 201, data: { user: registeredUser } };

};

exports.list = async (req, h) => {

    let User = req.server.plugins.database.mongoose.model('User');

    try{
        var query = await User.find().select('name email');
    }catch(e){
        return boom.internal();
    }

    return { statusCode: 200, data: { users: query }};
};

exports.findById = async (req, h) => {

    let User = req.server.plugins.database.mongoose.model('User');
    let foundUser = null;

    try{
        foundUser = await User.findById(req.params.id, { password: false });
    }catch(e){
        return boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: { user: foundUser } };
};

exports.update = async (req, h) => {

    let User = req.server.plugins.database.mongoose.model('User');

    try{
        var updated = await User.findByIdAndUpdate(req.params.id, req.payload);
    }//manejar error 11000 correo en uso
    catch(error){
        if(error.code == 11000){ return boom.conflict('Correo electrónico en uso'); }
        return boom.internal('Ocurrió un error al intentar modificar los datos del usuario');
    }
    
    return { statusCode: 200, data: {} };
};

exports.delete = async (req, h) => {

    let User = req.server.plugins.database.mongoose.model('User');
    let deleted;

    try{
        deleted = await User.findByIdAndRemove(req.params.id);
    }catch(error){
        return boom.internal();
    }

    if(!deleted){ return boom.notFound('El usuario no existe'); }

    return { statusCode: 204, data: {} };

};

exports.me = async (req, h) => {

    let User = req.server.plugins.database.mongoose.model('User');

    let foundUser;

    try{
        foundUser = await User.findById(req.auth.credentials.id, { password: false });
    }catch(e){
        return boom.internal();
    }
    
    return { statusCode: 200, data: { user: foundUser } };
};

exports.login = async (req, h) => {

    let User = req.server.plugins.database.mongoose.model('User');

    try{
         var foundUser = await User.findOne({ email: req.payload.email });
    }catch(e){
        return boom.internal('Error consultando la base de datos');
    }

    if(!foundUser){
        return boom.badData('Combinacion de Usuario/Contraseña incorrectos');
    }

    let same = await foundUser.validatePassword(req.payload.password, foundUser.password);
    
    if(!same){
        return boom.badData('Combinacion de Usuario/Contraseña incorrectos');
    }

    let payload = {
        iss: 'http://delifood.com',
        sub: foundUser.id,
        scope: foundUser.role
    };

    let userToReturn = {
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        id: foundUser.id
    };

    let token = await jwt.sign(payload, cfg.jwt.secret);

    return { statusCode: 200, data: { user: userToReturn, token: token } };

};