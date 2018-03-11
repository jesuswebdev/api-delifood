'use strict'

const boom = require('boom');
const jwt = require('jsonwebtoken');
const cfg = require('../../config/config');

module.exports = {
    name: 'authScheme',
    version: '1.0.0',
    register: async function(server, options){
        const userScheme = (server) => {
            return {
                authenticate: async (req, h) => {

                    let User = req.server.plugins.database.mongoose.model('User');
                    let token = null, credenciales = null, payload = null, authUser = null;
                
                    if(!req.raw.req.headers.authorization){
                        return boom.unauthorized('No tienes autorización', ['Bearer']);
                    }

                    try{
                        token = req.raw.req.headers.authorization.slice(7);
                    }catch(e){
                        return boom.badRequest('Token no válido')
                    }

                    try{
                        payload = jwt.verify(token, cfg.jwt.secret);
                    }
                    catch(e){ return boom.badRequest('Token no válido'); }
                    
                    if(payload.sub == 'guest'){
                        credenciales = {
                            name: payload.sub,
                            scope: payload.scope
                        };
                    }
                    else{
                        try{
                            authUser = await User.findById(payload.sub);

                            credenciales = {
                                name: authUser.name,
                                email: authUser.email,
                                scope: authUser.role,
                                id: authUser.id
                            };

                        }catch(e){
                            return boom.internal('Error consultando la base de datos');
                        }
                    }
                    
                    if(!authUser && payload.sub != 'guest'){
                        return boom.unauthorized('No estás autorizado');
                    }

                    return h.authenticated({ credentials: credenciales });
                }//authenticate
            };//return
        };//const userScheme

        await server.auth.scheme('userScheme', userScheme);
        await server.auth.strategy('userAuth', 'userScheme');
        await server.auth.default({
            strategy: 'userAuth'
        });
    }
}