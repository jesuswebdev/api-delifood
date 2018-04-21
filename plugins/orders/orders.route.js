'use strict';

const { create, list, findById } = require('./orders.controller');
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
            handler: list,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                },
                validate: {
                    payload: false,
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

        //find order by id
        server.route({
            method: 'GET',
            path: '/{id}',
            handler: findById,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
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
