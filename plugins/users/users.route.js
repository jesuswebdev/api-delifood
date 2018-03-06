const UsersController = require('./users.controller');
const joi = require('joi');
const bcrypt= require('bcrypt');

const usersRoute = {
    name: 'users-routes',
    version: '1.0.0',
    register: async (server, options) => {

        //hello
        server.route({
            method: 'GET',
            path: '/hello',
            handler: async (req, h) => {
                let a = '$2a$10$cq1sq1YuL0OpvOs3dDaDK.1aMrB6.C75T7h5WrBpN9/afQYAuvSdu';
                let n = 0;
                try{
                    n = await bcrypt.getRounds('adasdasdas');
                }catch(e){
                    n = -1;
                }
                
                return { rondas: n };
                //return { hola: 'mundo' };
            },
            options: {
                auth: false
            }
        })

        //get all users
        server.route({
            method: 'GET',
            path: '/',
            handler: UsersController.list,
            options: {
                auth: {
                    access: {
                        scope: ['admin']
                    }
                },
                validate: {
                    headers: joi.object({
                        'authorization': joi.string().min(64).required()
                    }).options({ allowUnknown: true })
                }
            }
        });

        //create new user
        server.route({
            method: 'POST',
            path: '/',
            handler: UsersController.create,
            options: {
                auth: {
                    strategy: 'basicAuth'
                },
                validate: {
                    payload: joi.object({
                        name: joi.string().min(6).required(),
                        email: joi.string().min(10).email().required(),
                        password: joi.string().min(6).required()
                    }),
                    headers: joi.object({
                        'authorization': joi.string().min(64).required()
                    }).options({ allowUnknown: true })
                }
            }
        });

        //get user by id
        server.route({
            method: 'GET',
            path: '/{id}',
            handler: UsersController.findById,
            options: {
                validate: {
                    params: joi.object({
                        id: joi.string().length(24).required()
                    }),
                    headers: joi.object({
                        'authorization': joi.string().min(64).required()
                    }).options({ allowUnknown: true })
                },
                auth: {
                    access: {
                        scope: ['user', 'admin']
                    }
                }
            }
        });

        //update user info
        server.route({
            method: 'PUT',
            path: '/{userId}',
            handler: ()=>{}
        })

        //delete user
        server.route({
            method: 'DELETE',
            path: '/{userId}',
            handler: ()=>{}
        })

        //login user
        server.route({
            method: 'POST',
            path: '/login',
            handler: UsersController.login,
            options: {
                auth: {
                    strategy: 'basicAuth'
                },
                validate: {
                    payload: joi.object({
                        email: joi.string().email().min(10).required(),
                        password: joi.string().min(6).required()
                    }),
                    headers: joi.object({
                        'authorization': joi.string().min(64).required()
                    }).options({ allowUnknown: true })
                }
            }
        })

    }
}

module.exports = usersRoute;