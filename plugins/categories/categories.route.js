'use strict';

const Category = require('./categories.controller');
const Joi = require('joi');

module.exports = {
    
    name: 'categories-routes',
    register: async (server, options) => {
        
        //crear categoria
        server.route({
            method: 'POST',
            path: '/',
            handler: Category.create,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                payload: {
                    maxBytes: 1048576,
                    output: 'file',
                    parse: true,
                    allow: 'multipart/form-data',
                    uploads: server.settings.app.uploadsDir
                },
                validate: {
                    payload: Joi.object({
                        name: Joi.string().min(4).regex(/^[a-zA-Z][a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.,]+$/).required(),
                        description: Joi.string().min(8).regex(/^[a-zA-Z][a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.,]+$/).optional(),
                        img: Joi.optional()
                    }),
                    query: false
                }
            }
        });

        //buscar categoria
        server.route({
            method: 'GET',
            path: '/',
            handler: Category.find,
            options: {
                auth: {
                    access: {
                        scope: ['guest', 'user', 'admin']
                    }
                },
                validate: {
                    payload: false,
                    query: Joi.object({
                        by: Joi.string().only(['id', 'slug', 'name']),
                        q: Joi.string()
                    }).allow(null).with('by','q')
                }
            }
        });

        //modificar categoria
        server.route({
            method: 'PUT',
            path: '/{id}',
            handler: Category.update,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                payload: {
                    maxBytes: 1048576,
                    output: 'file',
                    parse: true,
                    allow: 'multipart/form-data',
                    uploads: server.settings.app.uploadsDir
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().alphanum().length(24).required().trim()
                    }),
                    payload: Joi.object({
                        name: Joi.string().min(4).required().trim(),
                        description: Joi.string().min(4).optional().trim(),
                        img: Joi.optional()
                    }),
                    query: false
                }
            }
        });

        //eliminar categoria
        server.route({
            method: 'DELETE',
            path: '/{id}',
            handler: Category.remove,
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

        //modificar imagen
        server.route({
            method: 'PUT',
            path: '/{id}/picture',
            handler: Category.updatePic,
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
                        img: Joi.required()
                    }),
                    query: false
                }
            }
        });
    }
};
