const ProductsController = require('./products.controller');
const joi = require('joi');

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
                    payload: joi.object({
                        name: joi.string().min(4).required().trim(),
                        description: joi.string().min(8).optional().trim(),
                        category: joi.string().length(24).alphanum().required().trim(),
                        price: joi.number().positive().precision(2).required(),
                        picture: joi.any().optional()
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
                    params: joi.object({
                        id: joi.string().alphanum().length(24).required().trim()
                    }),
                    payload: false,
                    query: false
                }
            }
        });

        //update product info

        //delete product
    }
}