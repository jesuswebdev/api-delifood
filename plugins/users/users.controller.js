'use strict';

const Cfg = require('../../config/config');
const Boom = require('boom');
const Iron = require('iron');
const Wreck = require('wreck');

exports.create = async (req, h) => {

    let User = req.server.plugins.db.UserModel;

    let foundUser = await User.findOne({ email: req.payload.email });
    let newUser;
    
    if (!foundUser) {
        try {
            newUser = new User(req.payload);
            newUser = await newUser.save();
        }
        catch (error) {
            //manejar error 11000 correo en uso
            if (error.code == 11000) {
                return Boom.conflict('Correo electrónico en uso');
            }
            return Boom.internal('Error al registrar el usuario');
        }
    }
    else if (foundUser && !foundUser.facebookId && !foundUser.googleId) {
        return Boom.conflict('Correo electronico en uso');
    }
    else if (foundUser && (foundUser.facebookId || foundUser.googleId)) {

        if (!foundUser.password) {
            foundUser.password = req.payload.password;
    
            try {
                newUser = await foundUser.save();
            }
            catch (error) {
                return Boom.internal('Error registrando usuario');
            }
        }
        else {
            return Boom.conflict('Correo electrónico en uso');
        }
    }

    return { statusCode: 200, data: newUser.id };
};

exports.find = async (req, h) => {

    let User = req.server.plugins.db.UserModel;
    let foundUser = null;
    let findOptions = {
        password: false
        // name: true,
        // email: true,
        // banned: true,
        // created: true,
        // role: true
    };
    //readability
    let by = req.query.by;
    let query = req.query.q;

    if (!by && !query) {
        try {
            foundUser = await User.find({}, findOptions);
        }
        catch (error) {
            return Boom.internal('Error consultando la base de datos');
        }
    }
    if (by === 'id') {
        if (query.length != 24) {
            return Boom.badRequest('ID no válido');
        }
        try {
            foundUser = await User.findById(query, findOptions);
        }
        catch (error) {
            return Boom.badRequest('ID no válido');
        }
    }
    if (by === 'name') {
        try {
            foundUser = await User.find({ name: { $regex: query, $options: 'i'}}, findOptions);
        }
        catch (error) {
            return Boom.internal('Error consultando la base de datos');
        }
    }
    
    return !foundUser || foundUser.length === 0 ?
            Boom.notFound('No se encontró nada') :
            { statusCode: 200, data: foundUser };

};

exports.update = async (req, h) => {

    let User = req.server.plugins.db.UserModel;
    let updatedUser = null;

    try {
        updatedUser = await User.findByIdAndUpdate(req.params.id, req.payload);
    }//manejar error 11000 correo en uso
    catch (error) {
        if (error.code == 11000) {
            return Boom.conflict('Correo electrónico en uso');
        }

        return Boom.internal('Ocurrió un error al intentar modificar los datos del usuario');
    }
    
    return !updatedUser ? 
            Boom.notFound('El usuario no existe') :
            { statusCode: 200, data: null };
};

exports.remove = async (req, h) => {

    let User = req.server.plugins.db.UserModel;
    let deleted = null;

    try {
        deleted = await User.findByIdAndRemove(req.params.id);
    }
    catch (error) {
        return Boom.internal();
    }

    if (!deleted) {
        return Boom.notFound('El usuario no existe');
    }

    return { statusCode: 200, data: null };
};

exports.me = async (req, h) => {

    let User = req.server.plugins.db.UserModel;
    let foundUser;

    try {
        foundUser = await User.findById(req.auth.credentials.id, { password: false });
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    return !foundUser ?
            Boom.notFound('El usuario no existe') :
            { statusCode: 200, data: foundUser };
};

exports.login = async (req, h) => {

    let User = req.server.plugins.db.UserModel;
    let foundUser = null;

    try {
        foundUser = await User.findOne({ email: req.payload.email });
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    if (!foundUser) {
        return Boom.badData('Combinacion de Usuario/Contraseña incorrectos');
    }
    
    let same = await foundUser.validatePassword(req.payload.password, foundUser.password);
    
    if (!same) {
        return Boom.badData('Combinacion de Usuario/Contraseña incorrectos');
    }

    if (foundUser.banned === true) {
        return Boom.forbidden('Tu cuenta se encuentra suspendida');
    }

    let payload = {
        name: foundUser.name,
        email: foundUser.email,
        sub: foundUser.id,
        scope: foundUser.role
    };

    let userToReturn = {
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        id: foundUser._id
    };

    let token = await Iron.seal(payload, Cfg.iron.password, Iron.defaults);

    return { statusCode: 200, data: { user: userToReturn, token: token } };
};

exports.hello = async (req, h) => {

    let payload = {
        sub: 'guest',
        scope: 'guest'
    };

    let token = await Iron.seal(payload, Cfg.iron.password, Iron.defaults);

    return token;
}

exports.facebookLogin = async (req, h) => {

    // url de la api de facebook para obtener el nombre, id y correo del token
    let facebookUrl = `https://graph.facebook.com/v2.12/me?fields=id,name,email&access_token=${req.payload.token}`;
    
    // se llama a la api con wreck
    let { payload } = await Wreck.get(facebookUrl);

    // se parsea la respuesta para poder tener el nombre, id y correo en un objeto
    let facebookResponse = JSON.parse(payload.toString());
    let User = req.server.plugins.db.UserModel;

    // se busca en la base de datos para saber si el usuario esta registrado con facebook
    let foundUser = await User.findOne({ facebookId: facebookResponse.id });
    
    // si el usuario no tiene facebookId
    if (!foundUser) {

        // se busca ahora por el correo para saber si existe
        foundUser = await User.findOne({ email: facebookResponse.email });
        
        // si el usuario no existe se crea
        if (!foundUser) {

            foundUser = new User();
            foundUser.name = facebookResponse.name;
            foundUser.email = facebookResponse.email;
            foundUser.facebookId = facebookResponse.id;

            try {
                foundUser = await foundUser.save();
            }
            catch (error) {
                return Boom.internal('Error registrando al usuario con facebook');
            }
        }
        else {
            foundUser = await User.findByIdAndUpdate(foundUser._id, { $set: { facebookId: facebookResponse.id } });
        }
    }

    if (foundUser.banned === true) {
        return Boom.forbidden('Tu cuenta se encuentra suspendida');
    }

    let tokenPayload = {
        name: foundUser.name,
        email: foundUser.email,
        sub: foundUser.id,
        scope: foundUser.role
    };

    let userToReturn = {
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        id: foundUser._id
    };

    let token = await Iron.seal(tokenPayload, Cfg.iron.password, Iron.defaults);

    return { statusCode: 200, data: { user: userToReturn, token: token } };
}

exports.googleLogin = async (req, h) => {
    return { text: 'google login'};
}
