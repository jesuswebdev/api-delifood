var Product = require('mongoose').model('Product');
var Category = require('./category.controller');

exports.create = function(req, res, next){
    var product = new Product(req.body);

    product.save(function(err){
      if(err){
        return next(err);
      } else {
        Category.addProduct( req, res, next, req.body.category );
        res.json( { success: true, message: "El producto fue creado con éxito" } );
      }
    });
};

exports.list = function(req, res, next){
    Product.find().populate('category', 'name').exec( (err, products) => {
        if(err){ return next(err); }
        else {
            res.json( { success: true, message: "Productos Encontrados", data: products } );
        }
    });
}

exports.read = function(req, res){
    res.json( { success: true, message: "Producto Encontrado", data: req.product } );
};

exports.findByName = (req, res) => {
    res.json( { success: true, message: "Productos Encontrados", data: req.products } );

}

exports.productByID = function(req, res, next, id){
    Product.findOne({
        _id: id
    }, function(err, product){
        if(err){
            return next(err);
        } else {
            req.product = product;
            next();
        }
    });
};

exports.productByName = (req, res, next, pName) => {
    Product
    .find({ name: { $regex: pName, $options: "i" } })
    .populate('category', 'name')
    .exec( (err, products) => {
        if(err){ return next(err); }
        else{
            req.products = products;
            next();
        }
    });
};

exports.update = function(req, res, next){

    var old = req.body.oldCategory;
    delete req.body.oldCategory;

    Product.findByIdAndUpdate(req.product.id, req.body, function(err, product){
        if(err){
            return next(err);
        } else {
            Category.deleteProduct(req, res, next, old);
            Category.addProduct(req, res, next, req.body.category);
            res.json( { success: true, message: "Los cambios se guardaron con exito" });
        }
    });
    
};

exports.delete = function(req, res, next){
    req.product.remove(function(err){
        if(err){
            return next(err);
        } else {
            Category.deleteProduct( req, res, next, req.product.category );
            res.json( { success: true, message: "El producto se elimino con exito"} );
        }
    });
};
