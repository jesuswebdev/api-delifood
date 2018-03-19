'use strict';

const { db } = require('./config');
const Mongoose = require('mongoose');

module.exports = {
        name: 'db',
        once: true,
        register: async (server, options) => {

                Mongoose.connect(db.uri);

                let connection = Mongoose.connection;

                connection.on('error', console.error.bind(console, 'connection error'));

                connection.once('open', () => {
                        console.log('Connection with database succeeded');
                });

                //load models
                let UserModel = require('../plugins/users/user.model')(Mongoose);
                let ProductModel = require('../plugins/products/product.model')(Mongoose);
                let CategoryModel = require('../plugins/categories/category.model')(Mongoose);
                let OrderModel = require('../plugins/orders/order.model')(Mongoose);

                server.expose('UserModel', UserModel);
                server.expose('ProductModel', ProductModel);
                server.expose('CategoryModel', CategoryModel);
                server.expose('OrderModel', OrderModel);
        }
};
