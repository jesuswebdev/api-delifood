'use strict';

const { create, list, findById, update, updatePicture, remove } = require('./products.controller');
const Joi = require('joi');

module.exports = {
    
    name: 'products-routes',
    register: async (server, options) => {

        //create product
        server.route({
            method: 'POST',
            path: '/',
            handler: create,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                payload: {
                    allow: 'multipart/form-data',
                    maxBytes: 1048576,
                    output: 'file',
                    parse: true,
                    uploads: server.settings.app.uploadsDir
                },
                validate: {
                    payload: Joi.object({
                        name: Joi.string().min(4).required().trim(),
                        description: Joi.string().min(8).optional().trim(),
                        category: Joi.string().length(24).alphanum().required().trim(),
                        price: Joi.number().positive().precision(2).required(),
                        img: Joi.any().optional()
                    }),
                    query: false
                }
            }
        });

        //list all products
        server.route({
            method: 'GET',
            path: '/',
            handler: list,
            options: {
                auth: {
                    access: {
                        scope: ['guest', 'user', 'admin']
                    }
                },
                validate: {
                    payload: false,
                    query: false
                }
            }
        })

        //find product by id
        server.route({
            method: 'GET',
            path: '/{id}',
            handler: findById,
            options: {
                auth: {
                    access: {
                        scope: ['guest', 'user', 'admin']
                    }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().alphanum().length(24).required().trim()
                    }),
                    payload: false,
                    query: false
                }
            }
        });

        //update product info
        server.route({
            method: 'PUT',
            path: '/{id}',
            handler: update,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().alphanum().length(24).required().trim()
                    }),
                    payload: Joi.object({
                        name: Joi.string().min(4).required().trim(),
                        description: Joi.string().min(8).required().trim(),
                        price: Joi.number().greater(0).precision(2).required(),
                        category: Joi.string().length(24).alphanum().required().trim()
                    }),
                    query: false
                }
            }
        });

        //delete product
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
                        id: Joi.string().alphanum().length(24).required().trim()
                    }),
                    payload: false,
                    query: false
                }
            }
        });

        //update product picture
        server.route({
            method: 'PUT',
            path: '/{id}/picture',
            handler: updatePicture,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                payload: {
                    allow: 'multipart/form-data',
                    maxBytes: 1048576,
                    output: 'file',
                    parse: true,
                    uploads: server.settings.app.uploadsDir
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().alphanum().length(24).required().trim()
                    }),
                    payload: Joi.object({
                        picture: Joi.any().required()
                    }),
                    query: false
                }
            }
        });
    }
}
