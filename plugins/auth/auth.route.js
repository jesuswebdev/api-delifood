'use strict';

const Cfg = require('../../config/config');
const Iron = require('iron');
const Joi = require('joi');

module.exports = {

    name: 'auth-routes',
    register: async (server, options) => {

        server.route({
            method: 'GET',
            path: '/admin',
            handler: async (req, h) => {

                let token = null;
                let payload = null;
                
                if (!req.raw.req.headers.authorization) {
                    return boom.unauthorized('No tienes autorización', ['Bearer']);
                }

                try {
                    token = req.raw.req.headers.authorization.slice(7);
                }
                catch (error) {
                    return boom.badRequest('Token no válido')
                }

                try {
                    payload = await Iron.unseal(token, Cfgfg.iron.password, Iron.defaults);
                }
                catch (error) {
                    return boom.badRequest('Token no válido');
                }

                if (payload.scope === 'admin') {
                    return { statusCode: 200, data: true };
                }

                return { statusCode: 200, data: false };
            },
            options: {
                auth: false,
                validate: {
                    headers: Joi.object({
                        'authorization': Joi.string().required().trim()
                    }).options({ allowUnknown: true }),
                    payload: false,
                    query: false
                }
            }
        });
    }
};