const CategoriesController = require('./categories.controller');
const joi = require('joi');
const path = require('path');

module.exports = {
    name: 'categories-routes',
    register: async (server, options) => {
        
        //crear categoria
        server.route({
            method: 'POST',
            path: '/',
            handler: CategoriesController.create,
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
                    payload: joi.object({
                        name: joi.string().min(4).regex(/^[a-zA-Z][a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,]+$/).required(),
                        description: joi.string().min(8).regex(/^[a-zA-Z][a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,]+$/).optional(),
                        img: joi.optional()
                    }),
                    query: false
                }
            }
        });

        //mostrar todas las categorias
        server.route({
            method: 'GET',
            path: '/',
            handler: CategoriesController.list,
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
        });

        //buscar categoria por id
        server.route({
            method: 'GET',
            path: '/{id}',
            handler: CategoriesController.findById,
            options: {
                auth: {
                    access: {
                        scope: ['guest', 'user', 'admin']
                    }
                },
                validate: {
                    params: joi.object({
                        id: joi.string().length(24).alphanum().required().trim()
                    }),
                    query: false,
                    payload: false
                }
            }
        });

        //modificar categoria
        server.route({
            method: 'PUT',
            path: '/{id}',
            handler: CategoriesController.update,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                validate: {
                    params: joi.object({
                        id: joi.string().alphanum().length(24).required().trim()
                    }),
                    payload: joi.object({
                        name: joi.string().min(4).required().trim(),
                        description: joi.string().min(4).optional().trim()
                    }),
                    query: false
                }
            }
        });

        //eliminar categoria
        server.route({
            method: 'DELETE',
            path: '/{id}',
            handler: CategoriesController.delete,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
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

        //modificar imagen
        server.route({
            method: 'PUT',
            path: '/{id}/picture',
            handler: CategoriesController.updatePic,
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
                    params: joi.object({
                        id: joi.string().alphanum().length(24).required().trim()
                    }),
                    payload: joi.object({
                        img: joi.required()
                    }),
                    query: false
                }
            }
        });
    }
};