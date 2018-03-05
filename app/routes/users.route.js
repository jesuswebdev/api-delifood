var users = require('../controllers/users.controller'),
    passport = require('passport');

module.exports = function(app){
    app.route('/users')
    .get(users.isAdmin, users.list)
    .post(users.create);

    app.route('/users/:userId')
    .get(users.hasAuthorization, users.read)
    .put(users.hasAuthorization, users.update)
    .delete(users.isAdmin, users.delete);
    
    app.param('userId', users.userByID);

    app.post('/signup', users.signup);

    app.post('/signin', users.signin);

    app.get('/authenticate',
        function(req, res, next){
         //   authorize(req, res, next, "authentication");
        } 
    );
    
    app.get('/signout',
        function(req, res, next){
           // authorize(req, res, next, "logout");
        }
    );

    //===================================================
    //              GOOGLE
    //===================================================

    app.get('/auth/google', users.googleSignIn);

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',users.googleCallback);    
};