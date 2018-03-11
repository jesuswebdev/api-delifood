'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const Hapi = require('hapi');
const CatboxMongoDB = require('catbox-mongodb');
const inert = require('inert');
const path = require('path');
const cfg = require('./config/config');

const server = new Hapi.Server({
    port: 3000,
    host: 'localhost',
    address: '0.0.0.0',
    app: {
        uploadsDir: path.join(__dirname, 'uploads')
    },
    routes: {
        files: {
            relativeTo: path.join(__dirname, 'uploads')
        }
    },
    cache: [{
        name: 'mongoDbCache',
        engine: CatboxMongoDB,
        uri: cfg.db.uri,
        partition: 'cache'
    }]
});

// Start the server
const init = async () => {
    //register inert
    await server.register(inert);
    
    //register db
    await server.register(require('./config/mongoose'));

    //register authentication scheme
    await server.register(require('./plugins/auth/auth.scheme'));
    //await server.register(require('./plugins/basic-auth/basic-auth.scheme'));

    //register routes

    //utility routes
    await server.register(require('./plugins/file-serve/file-serve.router'), { routes: { prefix: '/api/uploads' } });
    await server.register(require('./plugins/auth/auth.route'), { routes: { prefix: '/api/auth' }});

    //resource routes
    await server.register(require('./plugins/users/users.route'),{ routes: { prefix: '/api/users' } });
    await server.register(require('./plugins/categories/categories.route'), { routes: { prefix: '/api/categories' } });
    await server.register(require('./plugins/products/products.route'), { routes: { prefix: '/api/products' } });
   
    //start server
    await server.start(); 
      
    console.log('Server running at:', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();