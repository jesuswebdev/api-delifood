'use strict';

const Boom = require('boom');
const fs = require('fs');
const path = require('path');

exports.create = async (req, h) => {

    if (req.payload.img) {
        req.payload.img = req.payload.img.path;
    }

    let Category = req.server.plugins.db.CategoryModel;
    let newCategory = new Category(req.payload);

    try {
        var createdCategory = await newCategory.save();
    }
    catch (error) {
        if (error.code == 11000) {
            return Boom.conflict('Ya existe una categoria con ese nombre');
        }

        return Boom.internal('Error al guardar la categoria');
    }
    
    return { statusCode: 201 , data: createdCategory };
};

exports.list = async (req, h) => {

    let Category = req.server.plugins.db.CategoryModel;
    let categorias = null, findOptions = null;
    let scope = req.auth.credentials.scope;

    if (scope === 'guest' || scope === 'user') {
        findOptions = {
            name: true,
            description: true
        };
    }

    if(scope === 'admin'){
        findOptions = { };
    }
    
    try {
        categorias = await Category.find({}, findOptions);
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: categorias };
};

exports.findById = async (req, h) => {

    let Category = req.server.plugins.db.CategoryModel;
    let foundCategory = null, findOptions = null;
    let scope = req.auth.credentials.scope;

    //lo que retorna la busqueda si es usuario registrado/no registrado
    if (scope === 'guest' || scope === 'user') {
        findOptions = {
            name: true,
            description: true
        };
    }

    //lo que retorna la busqueda si es admin
    if (scope === 'admin') {
        findOptions = {
            name: true,
            description: true,
            productsCount: true
        }
    }
    
    try {
        foundCategory = await Category.findById(req.params.id, findOptions);
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }
    
    return { statusCode: 200, data: foundCategory };
};

exports.update = async (req, h) => {

    let Category = req.server.plugins.db.CategoryModel;

    try {
        await Category.findByIdAndUpdate(req.params.id, req.payload);
    }
    catch (error) {
        if (error.code == 11000) {
            return Boom.conflict('Ya existe una categoria con ese nombre');
        }

        return Boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: null };
};

exports.remove = async (req, h) => {

    let Category = req.server.plugins.db.CategoryModel;
    let deleted;
    try {
        deleted = await Category.findByIdAndRemove(req.params.id);
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    if (!deleted) {
        return Boom.notFound('La categoria no existe');
    }

    try {
        await fs.unlinkSync(deleted.img);
    }
    catch (error) {
        return Boom.internal('Ocurrió un error al intentar eliminar la categoria');
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
    let newImg = path.join(path.dirname(categoria.img.path), path.basename(req.payload.img.path));
    
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
