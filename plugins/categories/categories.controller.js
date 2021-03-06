'use strict';

const Boom = require('boom');
const fs = require('fs');
const Path = require('path');

exports.create = async (req, h) => {

    if (req.payload.img) {
        req.payload.img = req.server.settings.app.serverUploadsPath + Path.basename(req.payload.img.path);
    }

    let Category = req.server.plugins.db.CategoryModel;
    let newCategory = new Category(req.payload);
    let createdCategory = null;

    try {
        createdCategory = await newCategory.save();
    }
    catch (error) {
        if (error.code == 11000) {
            return Boom.conflict('Ya existe una categoria con ese nombre');
        }

        return Boom.internal('Error al guardar la categoria');
    }
    
    return { statusCode: 201 , data: createdCategory };
};

exports.find = async (req, h) => {

    let Category = req.server.plugins.db.CategoryModel;
    let categorias = null;
    let findOptions = null;
    let scope = req.auth.credentials.scope;

    if (scope === 'guest' || scope === 'user') {
        findOptions = {
            name: true,
            description: true,
            slug: true
        };
    }

    if(scope === 'admin'){
        findOptions = { };
    }
    
    if (!req.query.by && !req.query.q) {
        try {
            categorias = await Category.find({}, findOptions);
        }
        catch (error) {
            return Boom.internal('Error consultando la base de datos');
        }
    }
    if (req.query.by === 'name') {
        try {
            categorias = await Category.find({ name: { $regex: req.query.q, $options: 'i' } }, findOptions);
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
            categorias = await Category.findById(req.query.q, findOptions);
        }
        catch (error) {
            return Boom.badRequest('ID no válido');
        }
    }
    if (req.query.by === 'slug') {
        try {
            categorias = await Category.find( { slug: req.query.q }, findOptions);
        }
        catch (error) {
            return Boom.internal('Error consultando la base de datos');
        }
    }

    return { statusCode: 200, data: categorias };
};

exports.update = async (req, h) => {

    let Category = req.server.plugins.db.CategoryModel;
    let oldImg = '';

    if (req.payload.img) {
        req.payload.img = req.server.settings.app.serverUploadsPath + Path.basename(req.payload.img.path);
    }

    try {
        if (req.payload.img) {
            oldImg = await Category.findById(req.params.id);
            oldImg = oldImg.img || null;
        }
        await Category.findByIdAndUpdate(req.params.id, req.payload);
    }
    catch (error) {
        if (error.code == 11000) {
            if (req.payload.img) {
                let img = Path.join(req.server.settings.app.uploadsDir, Path.basename(req.payload.img));
                await fs.unlinkSync(img);
            }
            return Boom.conflict('Ya existe una categoria con ese nombre');
        }

        return Boom.internal('Error consultando la base de datos');
    }

    if (oldImg) {
        let img = Path.join(req.server.settings.app.uploadsDir, Path.basename(oldImg));
        await fs.unlinkSync(img);
    }

    return { statusCode: 200, data: null };
};

exports.remove = async (req, h) => {

    let Category = req.server.plugins.db.CategoryModel;
    let deleted = null;

    try {
        deleted = await Category.findByIdAndRemove(req.params.id);
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    if (!deleted) {
        return Boom.notFound('La categoria no existe');
    }

    if (deleted.img) {
        try {
            let img = Path.join(req.server.settings.app.uploadsDir, Path.basename(deleted.img));
            await fs.unlinkSync(img);
        }
        catch (error) {
            return Boom.internal('Ocurrió un error al intentar eliminar la categoria');
        }
    }

    return { statusCode: 200, data: null };
};

exports.updatePic = async (req, h) => {

    let Category = req.server.plugins.db.CategoryModel;
    let categoria;

    try {
        categoria = await Category.findById(req.params.id);
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    if (!categoria) {
        return Boom.notFound('La categoria no existe');
    }

    let oldImg = categoria.img.path;
    let newImg = Path.join(Path.dirname(categoria.img.path), Path.basename(req.payload.img.path));
    
    try {
        await fs.copyFileSync(req.payload.img.path, newImg);
        await fs.unlinkSync(oldImg);
        await fs.unlinkSync(req.payload.img.path);
    }
    catch (error) {
        return Boom.internal('Error copiando archivos');
    }
        
    categoria.img.path = newImg;

    try {
        await Category.findByIdAndUpdate(req.params.id, categoria);
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: null };
};

exports.addNewProduct = async (req, categoryId) => {
    
    let Category = req.server.plugins.db.CategoryModel;

    try {
        await Category.findByIdAndUpdate(categoryId, { $inc: { productsCount: 1 } });
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }
}

exports.removeProduct = async (req, categoryId) => {
    
    let Category = req.server.plugins.db.CategoryModel;

    try {
        await Category.findByIdAndUpdate(categoryId, { $inc: { productsCount: -1 } });
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }
}
