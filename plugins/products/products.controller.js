'use strict';

const { addNewProduct, removeProduct } = require('../categories/categories.controller');
const Boom = require('boom');
const fs = require('fs');
const Path = require('path');

exports.create = async (req, h) => {

    let Product = req.server.plugins.db.ProductModel;
    let payload = req.payload;
    
    if (payload.img) {

        payload.img = req.server.settings.app.serverUploadsPath + Path.basename(payload.img.path);
    }

    let newProduct = new Product(payload);

    try {
        newProduct = await newProduct.save();
    }
    catch (error) {
        if (error.code === 11000) {
            if (payload.picture) {
                await fs.unlinkSync(newProduct.img.path);
            }

            return Boom.conflict('Ya existe un producto con ese nombre'); 
        }

        return Boom.internal('Error consultando la base de datos');
    }

    await addNewProduct(req, payload.category);

    return { statusCode: 201, data: newProduct.id };
};

exports.find = async (req, h) => {

    let Product = req.server.plugins.db.ProductModel;
    let findOptions = null;
    let scope = req.auth.credentials.scope;
    let foundProduct = null;
    let resultsCount = 0;
    let aggregateStages = [];

    if (scope === 'guest' || scope === 'user') {
        findOptions = {
            name: true,
            description: true,
            category: true,
            price: true,
            img: true,
            slug: true
        };
    }

    if (!req.query.by && !req.query.q) {
        try {
            if(req.query.init && req.query.init === true) {
                resultsCount = await Product.count({});
            }
            
            if (req.query.offset || req.query.limit) {
                if (req.query.offset) {
                    aggregateStages.push({ $skip: req.query.offset });
                }
                if (req.query.limit) {
                    aggregateStages.push({ $limit: req.query.limit });
                }
                if (scope != 'admin') {
                    aggregateStages.push({ $project: findOptions });
                }
                
                foundProduct = await Product.aggregate(aggregateStages);
                foundProduct = await Product.populate(foundProduct, { path: 'category', select : 'name slug' });
            }
            else {
                foundProduct = await Product.find({}, findOptions).populate('category', 'name slug');
            }
        }
        catch (error) {
            return Boom.internal('Error consultando la base de datos');
        }
    }
    if (req.query.by === 'id') {
        if (req.query.q.length != 24) {
            return Boom.badRequest('ID no válido');
        }
        try {
            foundProduct = await Product.findById(req.query.q, findOptions).populate('category', 'name slug');
        }
        catch (error) {
            return Boom.badRequest('ID no válido');
        }
    }
    if (req.query.by === 'slug') {
        try {
            foundProduct = await Product.findOne({ slug: req.query.q }, findOptions).populate('category', 'name slug');
        }
        catch (error) {
            return Boom.internal('Error consultando la base de datos');
        }
    }
    if (req.query.by === 'name') {
        try {
            if(req.query.init && req.query.init === true) {
                resultsCount = await Product.count({ name: { $regex: req.query.q, $options: 'i' } });
            }
            if (req.query.offset || req.query.limit) {
                aggregateStages.push({ $match: { name: { $regex: req.query.q, $options: 'i' } }});

                if (req.query.offset) {
                    aggregateStages.push({ $skip: req.query.offset });
                }
                if (req.query.limit) {
                    aggregateStages.push({ $limit: req.query.limit });
                }
                if (scope != 'admin') {
                    aggregateStages.push({ $project: findOptions });
                }
                
                foundProduct = await Product.aggregate(aggregateStages);
                foundProduct = await Product.populate(foundProduct, { path: 'category', select : 'name slug' });
            }
            else {
                foundProduct = await Product.find({ name: { $regex: req.query.q, $options: 'i' } }, findOptions).populate('category', 'name slug');
            }
        }
        catch (error) {
            return Boom.internal('Error consultando la base de datos');
        }
    }

    if (req.query.init && req.query.init === true) {
        return { statusCode: 200, data: { results: foundProduct, count: resultsCount } };
    }

    return { statusCode: 200, data: foundProduct };
};

exports.update = async (req, h) => {
    
    let Product = req.server.plugins.db.ProductModel;
    let oldImg = null;

    if (req.payload.img) {
        req.payload.img = req.server.settings.app.serverUploadsPath + Path.basename(req.payload.img.path);
    }

    try {
        if (req.payload.img) {
            oldImg = await Product.findById(req.params.id);
            oldImg = oldImg.img || null;
        }
        await Product.findByIdAndUpdate(req.params.id, req.payload);
    }
    catch (error) {
        if (error.code == 11000) {
            if (req.payload.img) {
                await fs.unlinkSync(req.payload.img);
            }
            return Boom.conflict('Ya existe un producto con ese nombre');
        }

        return Boom.internal('Error consultando la base de datos');
    }
    
    if (oldImg) {
        await fs.unlinkSync(oldImg);
    }
    
    return { statusCode: 200, data: null };
};

exports.remove = async (req, h) => {

    let Product = req.server.plugins.db.ProductModel;
    let deletedProduct = null;

    try {
        deletedProduct = await Product.findByIdAndRemove(req.params.id);
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    if (!deletedProduct) {
        return Boom.notFound('El producto no existe');
    }

    await removeProduct(req, deletedProduct.category);

    return { statusCode: 200, data: null };
};

exports.updatePicture = async (req, h) => {
    
    let Product = req.server.plugins.db.ProductModel;
    let payload = req.payload;
    
    if (!payload.picture.path ||
        !payload.picture.headers ||
        !payload.picture.bytes) {

        return Boom.badRequest('No hay imagen para procesar');
    }

    let picture = {
        path: payload.picture.path,
        contentType: payload.picture.headers['content-type'],
        bytes: payload.picture.bytes
    };
    
    delete payload.picture;
    payload['picture'] = picture;
    

    let updatedProduct = null;

    try {
        updatedProduct = await Product.findByIdAndUpdate(req.params.id, payload)
    }
    catch (error) {
        await fs.unlinkSync(payload.picture.path);
        
        return Boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: null };
};
