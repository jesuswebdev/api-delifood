'use strict';

const Boom = require('boom');

module.exports = {

    name: 'file-serve-route',
    register: async (server, options) => {

        server.route({
            method: 'GET',
            path: '/{file*}',
            handler: (req, h) => {
                
                return h.file(req.params.file);
            },
            options: {
                auth: false,
                files: {
                    relativeTo: server.settings.app.uploadsDir
                }
            }
        });

        server.route({
            method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            path: '/',
            handler: (req, h) => {

                return Boom.methodNotAllowed()
            },
            options: {
                auth: false,
                validate: {
                    payload: false,
                    query: false
                }
            }
        });
    }
}
