'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const Hapi = require('hapi');
const CatboxMongoDB = require('catbox-mongodb');
const Inert = require('inert');
const Path = require('path');
const Cfg = require('./config/config');

const server = new Hapi.Server({
    port: process.env.PORT || 3000,
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
            prefix: '/uploads'
        }
    });

    await server.register({
        plugin: require('./plugins/auth/auth.route'),
        routes: {
            prefix: '/auth'
        }
    });

    //resource routes
    await server.register({
        plugin: require('./plugins/users/users.route'),
        routes: {
            prefix: '/users'
        }
    });

    await server.register({
        plugin: require('./plugins/products/products.route'),
        routes: {
            prefix: '/products'
        }
    });

    await server.register({
       plugin: require('./plugins/categories/categories.route'),
       routes: {
           prefix: '/categories'
       } 
    });

    await server.register({
        plugin: require('./plugins/orders/orders.route'),
        routes: {
            prefix: '/orders'
        }
    });
    
    await server.register({
        plugin: require('./plugins/test/test.route'),
        routes: {
            prefix: '/test'
        }
    });

    server.route({
        method: 'GET',
        path: '/info',
        options: {
            auth: false
        },
        handler: async (req, h) => {
            return { status: 'up', environment: process.env.NODE_ENV, server: 'node.js', framework: 'hapi.js', database: 'mongodb' };
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
