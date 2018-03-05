var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    config = require('../config');

User = require('mongoose').model('User');

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
opts.secretOrKey = config.jwtSecret;
//opts.issuer = 'localhost';
//opts.audience = 'localhost';

module.exports = function(passport){
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        //console.log(jwt_payload);
        User.findOne({email: jwt_payload.email}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
};
