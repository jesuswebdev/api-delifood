'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const Hapi = require('hapi');
const CatboxMongoDB = require('catbox-mongodb');
const Inert = require('inert');
const Path = require('path');
const Cfg = require('./config/config');

const server = new Hapi.Server({
    port: 3000,
    host: 'localhost',
    address: '0.0.0.0',
    app: {
        uploadsDir: Path.join(__dirname, 'uploads')
    },
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'uploads')
        },
        cors: true, 
    },
    cache: [{
        name: 'mongoDbCache',
        engine: CatboxMongoDB,
        uri: Cfg.db.uri,
        partition: 'cache'
    }]
});

// Start the server
const init = async () => {

    //register inert
    await server.register({
        plugin: Inert
    });

    //register db
    await server.register({
        plugin: require('./config/mongoose')
    });
    
    //register authentication scheme
    await server.register({
        plugin: require('./plugins/auth/auth.scheme')
    });
    
    //register routes

    //utility routes
    await server.register({
        plugin: require('./plugins/file-serve/file-serve.router'),
        routes: {
            prefix: '/api/uploads'
        }
    });

    await server.register({
        plugin: require('./plugins/auth/auth.route'),
        routes: {
            prefix: '/api/auth'
        }
    });

    //resource routes
    await server.register({
        plugin: require('./plugins/users/users.route'),
        routes: {
            prefix: '/api/users'
        }
    });

    await server.register({
        plugin: require('./plugins/products/products.route'),
        routes: {
            prefix: '/api/products'
        }
    });

    await server.register({
       plugin: require('./plugins/categories/categories.route'),
       routes: {
           prefix: '/api/categories'
       } 
    });

    await server.register({
        plugin: require('./plugins/orders/orders.route'),
        routes: {
            prefix: '/api/orders'
        }
    });
    
    await server.register({
        plugin: require('./plugins/test/test.route'),
        routes: {
            prefix: '/test'
        }
    });

    //start server
    await server.start(); 
      
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

server.events.on('response', function (request) {

    console.log(`${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.url.path} --> ${request.response.statusCode}`);
});

init();

module.exports = server;