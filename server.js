'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const Hapi = require('hapi');

const server = new Hapi.Server({
    port: 3000,
    host: 'localhost'
});

// Start the server
async function start(){
    try { 
        //register db
        await server.register(require('./config/mongoose'));
        //register authentication scheme
        await server.register(require('./plugins/auth/auth.scheme'));
        //register routes
        await server.register(require('./plugins/users/users.route'),{
            routes: {
                prefix: '/api/users'
            }
        });
        await server.start(); 
    }
    catch(err){ 
        console.log(err); 
        process.exit(1); 
    }
    console.log('Server running at', server.info.uri);
};

start();