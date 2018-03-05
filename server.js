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
        //require('./config/routes')(server);
        await server.register(require('./app/plugins/users/users.route'),{
            routes: {
                prefix: '/users'
            }
        });
        await server.register(require('./app/plugins/auth/auth.scheme'));
        await server.start(); 
    }
    catch(err){ 
        console.log(err); 
        process.exit(1); 
    }
    console.log('Server running at', server.info.uri);
};

start();