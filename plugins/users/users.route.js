const UsersController = require('./users.controller');
const joi = require('joi');

module.exports = {
    name: 'users-routes',
    register: async (server, options) => {

        //get all users
        server.route({
            method: 'GET',
            path: '/',
            handler: UsersController.list,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                validate: {
                    headers: joi.object({
                        'authorization': joi.string().min(64).required().trim()
                    }).options({ allowUnknown: true }),
                    payload: false,
                    query: false
                }
            }
        });

        //create new user
        server.route({
            method: 'POST',
            path: '/',
            handler: UsersController.create,
            options: {
                auth: {
                    strategy: 'basicAuth',
                    access: {
                        scope: ['guest', 'admin']
                    }
                },
                validate: {
                    payload: joi.object({
                        name: joi.string().min(6).required().trim(),
                        email: joi.string().min(10).email().required().trim(),
                        password: joi.string().min(6).required().trim()
                    }),
                    headers: joi.object({
                        'authorization': joi.string().min(64).required().trim()
                    }).options({ allowUnknown: true }),
                    query: false
                }
            }
        });

        //get user by id
        server.route({
            method: 'GET',
            path: '/{id}',
            handler: UsersController.findById,
            options: {
                validate: {
                    params: joi.object({
                        id: joi.string().length(24).alphanum().required().trim()
                    }),
                    headers: joi.object({
                        'authorization': joi.string().min(64).required().trim()
                    }).options({ allowUnknown: true }),
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
            handler: UsersController.me,
            options: {
                validate: {
                    headers: joi.object({
                        'authorization': joi.string().min(64).required().trim()
                    }).options({ allowUnknown: true }),
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
            handler: UsersController.update,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                },
                validate: {
                    headers: joi.object({
                        'authorization': joi.string().min(64).required().trim()
                    }).options({ allowUnknown: true }),
                    params: joi.object({
                        id: joi.string().length(24).alphanum().required().trim()
                    }),
                    payload: joi.object({
                        name: joi.string().regex(/^[a-zA-Z][a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+$/).min(6).required().trim(),
                        email: joi.string().email().required().trim()
                    }),
                    query: false
                }
            }
        });

        //delete user
        server.route({
            method: 'DELETE',
            path: '/{id}',
            handler: UsersController.delete,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                validate: {
                    headers: joi.object({
                        'authorization': joi.string().min(64).required().trim()
                    }).options({ allowUnknown: true }),
                    params: joi.object({
                        id: joi.string().length(24).alphanum().required().trim()
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
            handler: UsersController.login,
            options: {
                auth: {
                    strategy: 'basicAuth',
                    access: {
                        scope: ['guest']
                    }
                },
                validate: {
                    payload: joi.object({
                        email: joi.string().email().min(10).required().trim(),
                        password: joi.string().min(6).required().trim()
                    }),
                    headers: joi.object({
                        'authorization': joi.string().min(64).required().trim()
                    }).options({ allowUnknown: true }),
                    query: false
                }
            }
        });
    }
}