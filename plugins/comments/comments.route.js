const commentsController = require('./comments.controller');
const Joi = require('joi');

module.exports = {
    name: 'comments-routes',
    register: async (server, options) => {

        // new comment
        server.route({
            method: 'POST',
            path: '/',
            handler: commentsController.create,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                },
                validate: {
                    payload: Joi.object({
                        user: Joi.string().alphanum().length(24).required(),
                        product: Joi.string().alphanum().length(24).required(),
                        text: Joi.string().min(2).max(120),
                        rating: Joi.number().min(0).max(5).integer()
                    }),
                    query: false
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/',
            handler: commentsController.find,
            options: {
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                },
                validate: {
                    payload: false,
                    query: Joi.object({
                        by: Joi.string().only(['id', 'product', 'user']),
                        q: Joi.string().alphanum().length(24),
                        offset: Joi.number().integer().positive(),
                        limit: Joi.number().integer().positive()
                    })
                    .allow(null).with('by', 'q')
                }
            }
        });
    }
}
