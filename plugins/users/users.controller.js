const cfg = require('../../config/config');
const boom = require('boom');
const jwt = require('jsonwebtoken');


exports.create = async (req, h) => {

    let correoEnUso = await emailTaken(req);

    if(correoEnUso){ return boom.conflict('Correo electrónico en uso'); }

    let User = req.server.plugins.database.mongoose.model('User');

    let newUser = new User(req.payload);

    try{
        var registeredUser = await newUser.save();
    }catch(e){
        return boom.internal('Error al registrar el usuario');
    }

    let token = await jwt.sign(registeredUser.email, cfg.jwt.secret);

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
    return { params: req.params };
};

exports.getToken = async (req, h) => {

};

exports.login = async (req, h) => {

    let User = req.server.plugins.database.mongoose.model('User');

    try{
         var foundUser = await User.findOne({ email: req.payload.email }).exec();
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
        sub: foundUser.email,
        scope: foundUser.role
    };

    let userToReturn = {
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
    };

    let token = await jwt.sign(payload, cfg.jwt.secret);

    return { statusCode: 200, data: { user: userToReturn, token: token } };

};

 async function emailTaken (req) {

    let User = req.server.plugins.database.mongoose.model('User');

    try{
        var query = await User.findOne({ email: req.payload.email });
    }catch(e){
        return boom.internal();
    }

    return query || false;
};