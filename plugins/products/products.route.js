'use strict';

const Products = require('./products.controller');
const Joi = require('joi');
const Boom = require('boom');

module.exports = {
    
    name: 'products-routes',
    register: async (server, options) => {

        //create product
        server.route({
            method: 'POST',
            path: '/',
            handler: Products.create,
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

        //find products
        server.route({
            method: 'GET',
            path: '/',
            handler: Products.find,
            options: {
                auth: {
                    access: {
                        scope: ['guest', 'user', 'admin']
                    }
                },
                validate: {
                    payload: false,
                    query: Joi.object({
                        by: Joi.string().only(['id','slug','name']),
                        q: Joi.string(),
                        limit: Joi.number().integer().positive(),
                        offset: Joi.number().integer().positive(),
                        init: Joi.boolean()
                    }).allow(null).with('by','q')
                }
            }
        });
        
        //metodos no permitidos para la ruta /
        server.route({
            method: ['PUT', 'PATCH', 'DELETE'],
            path: '/',
            handler: () => {
                return Boom.methodNotAllowed();
            },
            options: {
                auth: false
            }
        });

        //update product info
        server.route({
            method: 'PUT',
            path: '/{id}',
            handler: Products.update,
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
                        name: Joi.string().min(4).required().trim(),
                        description: Joi.string().min(8).required().trim(),
                        price: Joi.number().greater(0).precision(2).required(),
                        category: Joi.string().length(24).alphanum().required().trim(),
                        img: Joi.optional()
                    }),
                    query: false
                }
            }
        });

        //delete product
        server.route({
            method: 'DELETE',
            path: '/{id}',
            handler: Products.remove,
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

        //update product picture
        server.route({
            method: 'PUT',
            path: '/{id}/picture',
            handler: Products.updatePicture,
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
