var Order = require('mongoose').model('Order');
var users = require('../controllers/users.controller');
var User = require('mongoose').model('User');

exports.create = function(req, res, next){
    var order = new Order(req.body);

    order.save(function(err){
      if(err){
        return next(err);
      } else {
        res.json( { success: true, message: 'Orden Creada', data: order._id } );
      }
    });
    
};

exports.list = function(req, res, next){

    order.find().populate('user', 'name').exec( (err, orders) => {
        if(err){ return next(err); }
        else { res.json(orders); }
    });
}

exports.read = function(req, res){
    res.json(req.order);
};

exports.orderByID = function(req, res, next, id){
    order.findOne({
        _id: id
    }, function(err, order){
        if(err){
            return next(err);
        } else {
            req.order = order;
            next();
        }
    });
};

exports.update = function(req, res, next){
    order.findByIdAndUpdate(req.order.id, req.body, function(err, order){
        if(err){
            return next(err);
        } else {
            res.json(order);
        }
    });
};

exports.delete = function(req, res, next){
    req.order.remove(function(err){
        if(err){
            return next(err);
        } else {
            res.json(req.order);
        }
    });
};

exports.hasAuthorization = (req, res, next) => {
    if((req.order.user.id !== req.user.id ) || (req.user.role !== 'admin' )){
        return res.json({"success": false, "message": "authorization-error"});
    }
    next();
};
