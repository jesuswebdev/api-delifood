var config = require('./config'),
    mongoose = require('mongoose'),
    options = { useMongoClient: true };

module.exports = function(){
    mongoose.connect(config.db, options);
    var db = mongoose.connection;

    require('../app/models/user.model');
    require('../app/models/product.model');
    require('../app/models/order.model');
    require('../app/models/category.model');

    return db;
};