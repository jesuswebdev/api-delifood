var config = require('./config');
var express = require('express');
var morgan = require('morgan');
var compress = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
//var session = require('express-session');
var passport = require('passport');
var cors = require('cors');
var path = require('path');


module.exports = function(){
    var app = express();

    if( process.env.NODE_ENV === 'development' ){
        app.use(morgan('dev'));
    } else if( process.env.NODE_ENV === 'production' ){
        app.use(compress());
    }

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

/*
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret
    }));
*/
    app.use(passport.initialize());
    //app.use(passport.session());
    app.use(cors());

    require('../app/routes/users.route')(app);
    require('../app/routes/orders.route')(app);
    require('../app/routes/products.route')(app);
    require('../app/routes/categories.route')(app);

    var imgPath = path.join(__dirname, '..', 'public/images');
    
    app.use( '/uploads', express.static( imgPath ));

    return app;

};
