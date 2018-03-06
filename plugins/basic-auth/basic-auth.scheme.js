'use strict'

const boom = require('boom');
const cfg = require('../../config/config');

module.exports = {
    name: 'basic',
    version: '1.0.0',
    register: async function(server, options){
        const basicScheme = (server) => {
            return {
                authenticate: async (req, h) => {

                    let token = req.raw.req.headers.authorization;

                    if(!token || token.length < 64){
                        return boom.unauthorized('Token no válido');
                    }

                    if(token.slice(7) != cfg.api.key){
                        return boom.unauthorized('Token no válido');
                    }

                    return h.authenticated({ credentials: {}});
                }//authenticate
            };//return
        };//const userScheme

        await server.auth.scheme('basicScheme', basicScheme);
        await server.auth.strategy('basicAuth', 'basicScheme');
    }
}