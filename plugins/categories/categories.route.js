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
                    maxBytes: 2097152,
                    output: 'file',
                    parse: true,
                    allow: 'multipart/form-data',
                    uploads: server.settings.app.uploadsDir
                },
                validate: {
                    headers: joi.object({
                        'authorization': joi.string().min(64).required().trim()
                    }).options({ allowUnknown: true }),
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

        //buscar categoria por id

        //modificar categoria

        //eliminar categoria

    }
};