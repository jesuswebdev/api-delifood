'use strict';

const { create, find, findById, payWithStripe } = require('./orders.controller');
const Joi = require('joi');

module.exports = {
    
    name: 'orders-routes',
    register: async (server, options) => {

        server.route({
            method: 'POST',
            path: '/payment/stripe',
            handler: payWithStripe,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                },
                validate: {
                    payload: Joi.object({
                        token: Joi.object().options({ allowUnknown: true }),
                        order: Joi.object({
                            products: Joi.array().items(Joi.object({
                                product: Joi.string().alphanum().length(24).required(),
                                unitPrice: Joi.number().positive().precision(2).required(),
                                quantity: Joi.number().positive().integer().min(1).required(),
                                totalPrice: Joi.number().positive().precision(2).required()
                            })),
                            totalPayment: Joi.number().positive().precision(2).min(1).required()
                        })
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

        //metodos no permitidos para la ruta raiz /
        server.route({
            method: ['POST', 'PUT', 'PATCH', 'DELETE'],
            path: '/',
            handler: (req, h) => {
                return Boom.methodNotAllowed();
            },
            options: {
                auth: false
            }
        });
    }
};
