'use strict';

const c = require('../../config/config');
const iron = require('iron');

exports.hello = async () => {
    return await iron.seal({ name: 'guest', scope: 'guest' },c.iron.password, iron.defaults);
}

exports.wat = async () => {
    return 'wat';
}

exports.list = async (req, h) => {

    let Users = req.server.plugins.db.UserModel;
    
    let foundUsers = await Users.find();

    return { users: foundUsers };
}