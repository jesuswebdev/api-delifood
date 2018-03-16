'use strict';

const Config = require('./config')
const Mongoose = require('mongoose');

module.exports = {

    name: 'database',
    register: async (server, options) => {

        await Mongoose.connect(Config.db.uri);

        require('../plugins/users/user.model')(Mongoose);
        require('../plugins/categories/category.model')(Mongoose);
        require('../plugins/products/product.model')(Mongoose);
        require('../plugins/orders/order.model')(Mongoose);

        server.expose('mongoose', Mongoose);
    }
};