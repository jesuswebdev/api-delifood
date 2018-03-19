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
    catch (error) {//manejar error 11000 correo en uso
        if (error.code == 11000) {
            return Boom.conflict('Correo electrónico en uso');
        }

        return Boom.internal('Error al registrar el usuario');
    }

    return { statusCode: 201, data: { user: newUser.id } };
};

exports.list = async (req, h) => {

    let User = req.server.plugins.db.UserModel;
    let users = [];

    try {
        users = await User.find({}, { name: true, email: true });
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: users };
};

exports.findById = async (req, h) => {

    let User = req.server.plugins.db.UserModel;
    let foundUser = null;

    try {
        foundUser = await User.findById(req.params.id, { password: false });
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: foundUser };
};

exports.update = async (req, h) => {

    let User = req.server.plugins.db.UserModel;

    try {
        await User.findByIdAndUpdate(req.params.id, req.payload);
    }//manejar error 11000 correo en uso
    catch (error) {
        if (error.code == 11000) {
            return Boom.conflict('Correo electrónico en uso');
        }

        return Boom.internal('Ocurrió un error al intentar modificar los datos del usuario');
    }
    
    return { statusCode: 200, data: null };
};

exports.remove = async (req, h) => {

    let User = req.server.plugins.db.UserModel;
    let deleted;

    try {
        deleted = await User.findByIdAndRemove(req.params.id);
    }
    catch (error) {
        return Boom.internal();
    }

    if (!deleted) {
        return Boom.notFound('El usuario no existe');
    }

    return { statusCode: 204, data: null };
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
