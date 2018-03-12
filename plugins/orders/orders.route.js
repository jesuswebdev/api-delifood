const OrdersController = require('./orders.controller');
const joi = require('joi');

module.exports = {
    name: 'orders-routes',
    register: async (server, options) => {

        //create order
        server.route({
            method: 'POST',
            path: '/',
            handler: OrdersController.create,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                },
                validate: {
                    payload: joi.object({
                        products: joi.array().items(joi.object({
                            product: joi.string().alphanum().length(24).required(),
                            unitPrice: joi.number().positive().precision(2).required(),
                            quantity: joi.number().positive().integer().min(1).required(),
                            totalPrice: joi.number().positive().precision(2).required()
                        })),
                        totalPayment: joi.number().positive().precision(2).min(1).required()
                    }),
                    query: false
                }
            }
        });

        //list orders
        server.route({
            method: 'GET',
            path: '/',
            handler: OrdersController.list,
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
        
        //find order by id
        server.route({
            method: 'GET',
            path: '/{id}',
            handler: OrdersController.findById,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
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
                    payload: joi.object(),
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
                    payload: joi.object(),
                    query: false
                }
            }
        });
 */
    }
};