'use strict';

const Boom = require('boom');
const Iron = require('iron');
const Cfg = require('../../config/config');
const authConfig = require('../../config/auth');

module.exports = {

    name: 'authScheme',
    register: async function(server, options){

        const userScheme = (server) => {

            return {
                authenticate: async (req, h) => {
                    
                    let token = null;
                    let credenciales = null;
                    let payload = null;
                    let auth = req.raw.req.headers.authorization || null;
                
                    if (!auth) {
                        return Boom.unauthorized('No tienes autorización', ['Bearer']);
                    }

                    try {
                        token = auth.slice(7);
                    }
                    catch (error) {
                        return Boom.badRequest('Token no válido');
                    }

                    try {
                        payload = await Iron.unseal(token, Cfg.iron.password, Iron.defaults);
                    }
                    catch (error) {
                        return Boom.badRequest('Token no válido'); 
                    }
                    
                    if (payload.sub === 'guest') {
                        credenciales = {
                            name: payload.name,
                            scope: payload.scope
                        };
                    }
                    else {
                        let User = req.server.plugins.db.UserModel;

                        try {
                            let foundUser = await User.findById(payload.sub);

                            if (!foundUser) {
                                return Boom.unauthorized('Error de autenticación. El usuario no existe');
                            }

                            credenciales = {
                                name: foundUser.name,
                                email: foundUser.email,
                                scope: foundUser.role,
                                id: foundUser.id
                            };
                        }
                        catch (error) {
                            return Boom.internal('Error consultando la base de datos');
                        }
                    }

                    return h.authenticated({ credentials: credenciales });
                }//authenticate
            };//return
        };//const userScheme

        await server.auth.scheme('userScheme', userScheme);
        await server.auth.strategy('userAuth', 'userScheme');
        await server.auth.default({ strategy: 'userAuth' });
    }
}
