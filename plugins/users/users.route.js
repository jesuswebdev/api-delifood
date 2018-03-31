'use strict';

const { hello, create, list, findById, update, remove, login, me, getUsersCount } = require('./users.controller');
const Joi = require('joi');

module.exports = {
    
    name: 'users-routes',
    register: async (server, options) => {
        
        //hello
        server.route({
            method: 'GET',
            path: '/hello',
            handler: hello,
            options: {
                auth: false
            }
        });
        
        //get all users
        server.route({
            method: 'GET',
            path: '/',
            handler: list,
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
            handler: create,
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
                        password: Joi.string().min(6).required().trim()
                    }),
                    query: false
                }
            }
        });
        
        //get user by id
        server.route({
            method: 'GET',
            path: '/{id}',
            handler: findById,
            options: {
                validate: {
                    params: Joi.object({
                        id: Joi.string().length(24).alphanum().required().trim()
                    }),
                    query: false,
                    payload: false
                },
                auth: {
                    access: {
                        scope: ['admin']
                    }
                }
            }
        });
        
        //get user profile
        server.route({
            method: 'GET',
            path: '/me',
            handler: me,
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
        
        //update user info
        server.route({
            method: 'PUT',
            path: '/{id}',
            handler: update,
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
                        email: Joi.string().email().required().trim()
                    }),
                    query: false
                }
            }
        });
        
        //delete user
        server.route({
            method: 'DELETE',
            path: '/{id}',
            handler: remove,
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

        //login user
        server.route({
            method: 'POST',
            path: '/login',
            handler: login,
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

        //get users count
        server.route({
            method: 'GET',
            path: '/count',
            handler: getUsersCount,
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
    }
} 
