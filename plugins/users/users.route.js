const UsersController = require('./users.controller');

const usersRoute = {
    name: 'usersRoute',
    version: '1.0.0',
    register: async (server, options) => {

        //hello
        server.route({
            method: 'GET',
            path: '/hello',
            handler: (req, h) => {
                return { hola: 'mundo' };
            },
            options: {
                auth: false
            }
        })

        //get all users
        server.route({
            method: 'GET',
            path: '/',
            handler: ()=>{}
        });

        //create new user
        server.route({
            method: 'POST',
            path: '/',
            handler: UsersController.create,
            options: {
                auth: false
            }
        });

        //get user by id
        server.route({
            method: 'GET',
            path: '/{userId}',
            handler: ()=>{}
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
            handler: ()=>{}
        })

    }
}

module.exports = usersRoute;