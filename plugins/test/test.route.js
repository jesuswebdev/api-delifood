'use strict';

const { hello, wat, list } = require('./test.controller');

module.exports = {
    name: 'test-routes',
    register: async (server, options) => {

        server.route({
            method: 'POST',
            path: '/',
            handler: (req, h) => {
                
                console.log(req.payload);
                return { status: 200, error: null };
            },
            options: {
                auth: false
            }
        });

        server.route({
            method: 'get',
            path: '/test2',
            handler: wat,
            options: {
                auth: {
                    access: {
                        scope: ['guest']
                    }
                }
            }
        });

        server.route({
            method: 'get',
            path: '/list',
            handler: list
        })


        
    }
}
