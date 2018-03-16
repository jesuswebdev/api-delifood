'use strict';

const ProductsController = require('./products.controller');
const Joi = require('joi');

module.exports = {
    
    name: 'products-routes',
    register: async (server, options) => {

        //create product
        server.route({
            method: 'POST',
            path: '/',
            handler: ProductsController.create,
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
                        picture: Joi.any().optional()
                    }),
                    query: false
                }
            }
        });

        //list all products
        server.route({
            method: 'GET',
            path: '/',
            handler: ProductsController.list,
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
            handler: ProductsController.findById,
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
            handler: ProductsController.update,
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
            handler: ProductsController.delete,
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
            handler: ProductsController.updatePicture,
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