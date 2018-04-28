'use strict';

const User = require('./users.controller');
const Joi = require('joi');
const Boom = require('boom');

module.exports = {
    
    name: 'users-routes',
    register: async (server, options) => {
        
        //hello
        server.route({
            method: 'GET',
            path: '/hello',
            handler: User.hello,
            options: {
                auth: false
            }
        });
        
        //find users
        server.route({
            method: 'GET',
            path: '/',
            handler: User.find,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                validate: {
                    payload: false,
                    query: false
                }
            }
        });
        
        //create new user
        server.route({
            method: 'POST',
            path: '/',
            handler: User.create,
            options: {
                auth: {
                    access: {
                        scope: ['guest', 'admin']
                    }
                },
                validate: {
                    payload: Joi.object({
                        name: Joi.string().min(6).required().trim(),
                        email: Joi.string().min(10).email().required().trim(),
                        password: Joi.string().min(6).required().trim(),
                        role: Joi.string().allow(['admin', 'user']).trim().optional()
                    }),
                    query: false
                }
            }
        });

        //metodos no permitidos para la ruta /
        server.route({
            method: ['PUT', 'PATCH', 'DELETE'],
            path: '/',
            handler: (req, h) => {
                return Boom.methodNotAllowed();
            },
            options: {
                auth: false
            }
        });
        
        //get user profile
        server.route({
            method: 'GET',
            path: '/me',
            handler: User.me,
            options: {
                validate: {
                    query: false,
                    payload: false
                },
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                }
            }
        });

        //no se ni siquiera si se usa esta ruta
        //metodos no permitidos para la ruta /me
        server.route({
            method: ['POST', 'PUT', 'PATCH', 'DELETE'],
            path: '/me',
            handler: (req, h) => {
                return Boom.methodNotAllowed();
            },
            options: {
                auth: false
            }
        });
        
        //update user info
        server.route({
            method: 'PUT',
            path: '/{id}',
            handler: User.update,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().length(24).alphanum().required().trim()
                    }),
                    payload: Joi.object({
                        name: Joi.string().regex(/^[a-zA-Z][a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+$/).min(6).required().trim(),
                        email: Joi.string().email().required().trim(),
                        id: Joi.string().alphanum().length(24).required().trim(),
                        role: Joi.string().allow(['user', 'admin']).required().trim(),
                        banned: Joi.boolean().required()
                    }),
                    query: false
                }
            }
        });
        
        //delete user
        server.route({
            method: 'DELETE',
            path: '/{id}',
            handler: User.remove,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().length(24).alphanum().required().trim()
                    }),
                    query: false,
                    payload: false
                }
            }
        });

        //metodos no permitidos para la ruta /{id}
        server.route({
            method: ['GET', 'POST', 'PATCH'],
            path: '/{id}',
            handler: (req, h) => {
                return Boom.methodNotAllowed();
            },
            options: {
                auth: false
            }
        });

        //login user
        server.route({
            method: 'POST',
            path: '/login',
            handler: User.login,
            options: {
                auth: {
                    access: {
                        scope: ['guest']
                    }
                },
                validate: {
                    payload: Joi.object({
                        email: Joi.string().email().min(10).required().trim(),
                        password: Joi.string().min(6).required().trim()
                    }),
                    query: false
                }
            }
        });

        //metodos no permitidos para la ruta /login
        server.route({
            method: ['GET', 'PUT', 'PATCH', 'DELETE'],
            path: '/login',
            handler: (req, h) => {
                return Boom.methodNotAllowed();
            },
            options: {
                auth: false
            }
        });

        server.route({
            method: 'POST',
            path: '/login/facebook',
            handler: User.facebookLogin,
            options: {
                auth: {
                    access: {
                        scope: ['guest']
                    }
                },
                validate: {
                    payload: Joi.object({
                        token: Joi.string().token().required()
                    }),
                    query: false
                }
            }
        });

        server.route({
            method: ['GET', 'PUT', 'PATCH', 'DELETE'],
            path: '/login/facebook',
            handler: (req, h) => {
                return Boom.methodNotAllowed();
            },
            options: {
                auth: false
            }
        });

        server.route({
            method: ['GET', 'PUT', 'PATCH', 'DELETE'],
            path: '/login/google',
            handler: (req, h) => {
                return Boom.methodNotAllowed();
            },
            options: {
                auth: false
            }
        });

        server.route({
            method: 'POST',
            path: '/login/google',
            handler: User.googleLogin,
            options: {
                auth: {
                    access: {
                        scope: ['guest']
                    }
                },
                validate: {
                    payload: Joi.object({
                        token: Joi.string().required()
                    }),
                    query: false
                }
            }
        });
    }
} 
