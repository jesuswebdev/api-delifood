var config = require('./config'),
    mongoose = require('mongoose');

const databaseConnection = {
    name: 'databaseConnection',
    version: '1.0.0',
    register: async (server, options) => {
        mongoose.connect(config.db.uri);
        let db = mongoose.connection;

        require('../plugins/users/user.model');

        return db;

    }
}

module.exports = databaseConnection;