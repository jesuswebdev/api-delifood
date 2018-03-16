'use strict';

const CategoryController = require('../categories/categories.controller');
const Boom = require('boom');
const fs = require('fs');

exports.create = async (req, h) => {

    let Product = req.server.plugins.database.mongoose.model('Product');
    let payload = req.payload;

    if (payload.picture) {
        let picture = {
            path: payload.picture.path,
            contentType: payload.picture.headers['content-type'],
            bytes: payload.picture.bytes
        };

        delete payload.picture;
        payload['picture'] = picture;
    }

    let newProduct = new Product(payload);

    try {
        newProduct = await newProduct.save();
    }
    catch (error) {
        if (error.code === 11000) {
            if (payload.picture) {
                await fs.unlinkSync(newProduct.picture.path);
            }

            return Boom.conflict('Ya existe un producto con ese nombre'); 
        }

        return Boom.internal('Error consultando la base de datos');
    }

    await CategoryController.addNewProduct(req, payload.category);

    return { statusCode: 201, data: newProduct.id };
};

exports.list = async (req, h) => {
    
    let Product = req.server.plugins.database.mongoose.model('Product');
    let findOptions = null;
    let scope = req.auth.credentials.scope;
    let foundProducts = null;

    if (scope === 'guest' || scope === 'user') {
        findOptions = {
            name: true,
            description: true,
            category: true,
            price: true,
            ['picture.path']: true
        };
    }

    if(scope === 'admin'){
        findOptions = {
            ['picture.contentType']: false,
            ['picture.bytes']: false
        };
    }

    try {
        foundProducts = await Product.find({}, findOptions).populate('category', 'name');
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: foundProducts };
};

exports.findById = async (req, h) => {

    let Product = req.server.plugins.database.mongoose.model('Product');
    let findOptions = null;
    let scope = req.auth.credentials.scope;
    let foundProduct = null;

    if (scope === 'guest' || scope === 'user') {
        findOptions = {
            name: true,
            description: true,
            category: true,
            price: true,
            ['picture.path']: true
        };
    }

    if(scope === 'admin'){
        findOptions = {
            ['picture.contentType']: false,
            ['picture.bytes']: false
        };
    }

    try {
        foundProduct = await Product.findById(req.params.id, findOptions).populate('category', 'name');
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: foundProduct };
};

exports.update = async (req, h) => {
    
    let Product = req.server.plugins.database.mongoose.model('Product');
    let updatedProduct = null;

    try {
        updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.payload);
    }
    catch (error) {
        if (error.code == 11000) {
            return Boom.conflict('Ya existe un producto con ese nombre');
        }

        return Boom.internal('Error consultando la base de datos');
    }
    
    return { statusCode: 200, data: updatedProduct.id };
};

exports.delete = async (req, h) => {

    let Product = req.server.plugins.database.mongoose.model('Product');
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

    await CategoryController.removeProduct(req, deletedProduct.category);

    return { statusCode: 200, data: null };
};

exports.updatePicture = async (req, h) => {
    
    let Product = req.server.plugins.database.mongoose.model('Product');
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