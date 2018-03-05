'use strict'

const boom = require('boom');
const jwt = require('jsonwebtoken');
const cfg = require('../../config/config');
const User = require('mongoose').model('User');

const authScheme = {
    name: 'authScheme',
    version: '1.0.0',
    register: async function(server, options){
        const userScheme = (server) => {
            return {
                authenticate: async (req, h) => {

                    let token = req.raw.req.headers.authorization;

                    try{
                        var payload = jwt.verify(token, cfg.jwt.secret);
                    }
                    catch(e){ return boom.unauthorized(); }

                    try{
                        var authUser = await User.find({ email: payload }).exec();
                    }  
                    catch(e){ return boom.internal(); }

                    if(!authUser){ return boom.unauthorized(); }

                    let credenciales = {
                        name: authUser.name,
                        email: authUser.email
                    };

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

module.exports = authScheme;