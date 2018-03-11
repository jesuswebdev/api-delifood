'use strict'

const boom = require('boom');
const iron = require('iron');
const cfg = require('../../config/config');

module.exports = {
    name: 'authScheme',
    version: '1.0.0',
    register: async function(server, options){
        const userScheme = (server) => {
            return {
                authenticate: async (req, h) => {
                    
                    let token = null, credenciales = null, payload = null;
                
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
                    
                    if(payload.sub == 'guest'){
                        credenciales = {
                            name: payload.name,
                            scope: payload.scope
                        };
                    }
                    else{
                        credenciales = {
                            name: payload.name,
                            email: payload.email,
                            scope: payload.scope,
                            id: payload.sub
                        };
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