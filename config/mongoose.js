var config = require('./config'),
    mongoose = require('mongoose');

module.exports = {
    name: 'database',
    register: async (server, options) => {

        await mongoose.connect(config.db.uri);

        server.expose('mongoose', mongoose);

        require('../plugins/users/user.model')(mongoose);

    }
};