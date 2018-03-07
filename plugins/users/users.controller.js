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

    let token = await jwt.sign(registeredUser.id, cfg.jwt.secret);

    return { statusCode: 201, data: { user: registeredUser, token: token } };

};

exports.list = async (req, h) => {

    let User = req.server.plugins.database.mongoose.model('User');

    try{
        var query = await User.find().select('name email');
    }catch(e){
        return boom.internal();
    }

    return { statusCode: 200, data: { queryResult: query }};
};

exports.findById = async (req, h) => {
    let User = req.server.plugins.database.mongoose.model('User');
    let foundUser = null;

    try{
        foundUser = await User.findOne({ _id: req.params.id }, { password: false });
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
    
    return { statusCode: 200, data: { user: updated } };
};

exports.delete = async (req, h) => {

};

exports.me = async (req, h) => {
    let User = req.server.plugins.database.mongoose.model('User');
    let foundUser;
    try{
        foundUser = await User.findOne({ _id: req.auth.credentials.id }, { password: false });
    }catch(e){
        return boom.unauthorized();
    }
    
    return { statusCode: 200, data: { user: foundUser } };
};

exports.getToken = async (req, h) => {

};

exports.login = async (req, h) => {

    let User = req.server.plugins.database.mongoose.model('User');

    try{
         var foundUser = await User.findOne({ email: req.payload.email });
    }catch(e){
        return boom.internal('Error consultando la base de datos');
    }

    if(!foundUser){
        return boom.unauthorized('Combinacion de Usuario/Contraseña incorrectos');
    }

    let same = await foundUser.validatePassword(req.payload.password, foundUser.password);
    
    if(!same){
        return boom.unauthorized('Combinacion de Usuario/Contraseña incorrectos');
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