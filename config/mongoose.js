var config = require('./config'),
    mongoose = require('mongoose');

module.exports = {
    name: 'database',
    register: async (server, options) => {

        await mongoose.connect(config.db.uri);

        require('../plugins/users/user.model')(mongoose);
        require('../plugins/categories/category.model')(mongoose);

        server.expose('mongoose', mongoose);
    }
};