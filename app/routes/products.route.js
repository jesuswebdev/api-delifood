var products = require('../controllers/products.controller');
var users = require('../controllers/users.controller');
var passport = require('passport');

module.exports = function(app){
	app.route('/products')
    .get(products.list)
    .post(users.isAdmin, products.create);

    app.route('/products/:productId')
    .get(products.read)
    .put(users.isAdmin, products.update)
    .delete(users.isAdmin, products.delete);

    app.route('/products/name/:productName')
    .get(products.findByName);

    app.param('productId', products.productByID);
    app.param('productName', products.productByName);
};