'use strict';

const { create, find, findById } = require('./orders.controller');
const Joi = require('joi');

module.exports = {
    
    name: 'orders-routes',
    register: async (server, options) => {

        //create order
        server.route({
            method: 'POST',
            path: '/',
            handler: create,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                },
                validate: {
                    payload: Joi.object({
                        products: Joi.array().items(Joi.object({
                            product: Joi.string().alphanum().length(24).required(),
                            unitPrice: Joi.number().positive().precision(2).required(),
                            quantity: Joi.number().positive().integer().min(1).required(),
                            totalPrice: Joi.number().positive().precision(2).required()
                        })),
                        totalPayment: Joi.number().positive().precision(2).min(1).required()
                    }),
                    query: false
                }
            }
        });

        //list orders
        server.route({
            method: 'GET',
            path: '/',
            handler: find,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                },
                validate: {
                    payload: false,
                    query: Joi.object({
                        by: Joi.string().only(['user', 'id']),
                        q: Joi.string().alphanum().length(24)
                    }).allow(null).with('by', 'q')
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

/* 
        //update order
        server.route({
            method: 'PUT',
            path: '/',
            handler: OrdersController.update,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                validate: {
                    payload: Joi.object(),
                    query: false
                }
            }
        });

        //delete order
        server.route({
            method: 'DELETE',
            path: '/',
            handler: OrdersController.delete,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                },
                validate: {
                    payload: Joi.object(),
                    query: false
                }
            }
        });
 */
        //metodos no permitidos para la ruta /{id}
        server.route({
            method: ['POST', 'PATCH'],
            path: '/{id}',
            handler: (req, h) => {
                return Boom.methodNotAllowed();
            },
            options: {
                auth: false
            }
        });
    }
};
