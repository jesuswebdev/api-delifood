var category = require('../controllers/category.controller');
var users = require('../controllers/users.controller')
var passport = require('passport');
var multer = require('multer');
var upload = multer({ dest: 'public/images' });

module.exports = function(app){
	app.route('/category')
    .post(users.isAdmin, upload.single('image'),category.create)
    .get(users.isAdmin, category.list);

    app.route('/category/:categoryId')
    .get(users.isAdmin, category.read)
    .put(users.isAdmin, category.update)
    .delete(users.isAdmin, category.delete);

    app.param('categoryId', category.categoryByID);
};