var Category = require('mongoose').model('Category');


exports.create = function(req, res, next){
	console.log(req.file.mimetype);
	console.log(req.file.destination);
	console.log(req.file.filename);
	console.log(req.file.path);
	console.log(req.file.encoding);
    Category.findOne({
        name: req.body.name
    }, (err, cat) => {

        if(err){ return next(err);}

        else if(cat)
        { 
            res.json({ success: false, message: "Ya existe una categoría con ese nombre" });
        }

        else
        { 
        	let categoria = {
        		name: req.body.name,
        		description: req.body.description,
        		img: {
        			url: '/uploads/' + req.file.filename,
        			mimetype: req.file.mimetype
        		}
        	};
            var category = new Category(categoria);
            category.save(function(err){
                if(err){
                    return next(err);
                } else {
                    res.json({ success: true, message: "Categoria creada con éxito", data: category });
                }
            });
        }
    });  
};

exports.list = function(req, res, next){
    Category.find({}, function(err, categories){
        if(err){
            return next(err);
        } else {
            res.json({ success: true, message: "Categorias encontradas", data: categories });
        }
    });
}

exports.read = function(req, res){
    res.json( { success: true, message: "Categoria encontrada", data: req.category } );
};

exports.categoryByID = function(req, res, next, id){
    Category.findOne({
        _id: id
    }, function(err, category){
        if(err){
            return next(err);
        } else {
            req.category = category;
            next();
        }
    });
};

exports.update = function(req, res, next){

	let categoria = req.category;
	console.log(req.body);
	categoria.name = req.body.name;
	categoria.description = req.body.description;
	if( req.file ){
		categoria['img'] = {
			url: '/uploads/' + req.file.filename,
        	mimetype: req.file.mimetype
        };
	}

    Category.findByIdAndUpdate(req.category.id, categoria, function(err, category){
        if(err){
            return next(err);
        } else {
            res.json( { success: true, message: "Los cambios se guardaron con éxito" } );
        }
    });
};

exports.delete = function(req, res, next){

    if( req.category.productCount > 0 ){
        res.json( { success: false, message: "No puede eliminar una categoria con productos registrados" } );
    }
    else{
        req.category.remove(function(err){
            if(err){
                return next(err);
            } else {
                res.json({ success: true, message: "La categoria se eliminó con exito"});
            }
        });
    }
};

exports.addProduct = (req, res, next, id) => {
    Category.update({ _id: id }, { $inc: { productCount: 1 } },
        (err, raw) => {
            if(err){ return next(err); }
            next();
        });
}

exports.deleteProduct = (req, res, next, id) => {
    Category.update({ _id: id }, { $inc: { productCount: -1 } },
        (err, raw) => {
            if(err){ return next(err); }
            next();
        });
}
