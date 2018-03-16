'use strict';

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
                auth: false
            }
        });
    }
}