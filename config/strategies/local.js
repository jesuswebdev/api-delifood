var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('User');

module.exports = function(){
    passport.use(new LocalStrategy(
        { usernameField: 'email'},
        function(username, password, done)
        {
            User.findOne( { email: username }, function(err, user){
                if(err){ return done(err); }
                if(!user){ return done(null, false, { message: 'Usuario no encontrado' }); }
                user.validPassword(password, function(same){
                    if( !same ){ return done(null, false, {message:"Combinacion de Usuario/Contraseña incorrectos"}); }
                    else { return done(null, user); }
                });//fin user valid password
            });//fin user find one
        }//fin function
    ));//fin passport use
};
