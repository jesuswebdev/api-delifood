'use strict';

const Cfg = require('../../config/config');
const Boom = require('boom');
const Iron = require('iron');

exports.create = async (req, h) => {

    let User = req.server.plugins.db.UserModel;
    let newUser = new User(req.payload);

    try {
        newUser = await newUser.save();
    }
    catch (error) {
        //manejar error 11000 correo en uso
        if (error.code == 11000) {
            return Boom.conflict('Correo electrónico en uso');
        }

        return Boom.internal('Error al registrar el usuario');
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

    if (!foundUser || foundUser.length === 0) {
        return Boom.notFound('No se encontró nada');
    }

    return { statusCode: 200, data: foundUser };

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

    if (!updatedUser) {
        return Boom.notFound('El usuario no existe');
    }
    
    return { statusCode: 200, data: null };
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

    if (!foundUser) {
        return Boom.notFound('El usuario no existe');
    }
    
    return { statusCode: 200, data: foundUser };
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
        id: foundUser.id
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
