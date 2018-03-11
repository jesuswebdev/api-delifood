const cfg = require('../../config/config');
const iron = require('iron');
const joi = require('joi');

module.exports = {
    name: 'auth-routes',
    register: async (server, options) => {

        server.route({
            method: 'GET',
            path: '/admin',
            handler: async (req, h) => {

                let token = null, payload = null;
                
                if(!req.raw.req.headers.authorization){
                    return boom.unauthorized('No tienes autorización', ['Bearer']);
                }

                try{
                    token = req.raw.req.headers.authorization.slice(7);
                }catch(e){
                    return boom.badRequest('Token no válido')
                }

                try{
                    payload = await iron.unseal(token, cfg.iron.password, iron.defaults);
                }
                catch(e){ return boom.badRequest('Token no válido'); }

                if(payload.scope == 'admin'){
                    return { statusCode: 200, data: true };
                }

                return { statusCode: 200, data: false };

            },
            options: {
                auth: false,
                validate: {
                    headers: joi.object({
                        'authorization': joi.string().required().trim()
                    }).options({ allowUnknown: true }),
                    payload: false,
                    query: false
                }
            }
        });
    }
};