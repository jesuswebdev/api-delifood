var orders = require('../../app/controllers/orders.controller');
var users = require('../../app/controllers/users.controller');

module.exports = function(app){
	app.route('/orders')
    .post(users.requiresLogin, orders.create)
    .get(users.requiresLogin, orders.list);

    app.route('/orders/:orderId')
    .get(orders.hasAuthorization, orders.read)
    .put(users.isAdmin, orders.update)
    .delete(users.isAdmin, orders.delete);

    app.param('orderId', orders.orderByID);
};
