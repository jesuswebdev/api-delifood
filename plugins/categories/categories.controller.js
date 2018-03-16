'use strict';

const Boom = require('boom');
const fs = require('fs');
const path = require('path');

exports.create = async (req, h) => {

    //si hay imagen
    if (req.payload.img) {
        //se crea una nueva ruta en la carpeta uploads con el id del usuario
        let userUploadsDir = path.join(req.server.settings.app.uploadsDir, req.auth.credentials.id);

        //verifica si el directorio existe
        let dirExists = await fs.existsSync(userUploadsDir);

        //si no existe lo crea
        if(!dirExists){ await fs.mkdirSync(userUploadsDir); }

        //extraemos el nombre de la imagen subida
        var imgPath = await path.basename(req.payload.img.path);

        //creamos un path nuevo para la imagen con el directorio del usuario y el nombre de la imagen
        imgPath = path.join(userUploadsDir, imgPath);

        //movemos la imagen del directorio uploads al directorio del usuario
        await fs.copyFileSync(req.payload.img.path, imgPath);

        //eliminamos la imagen del directorio uploads
        await fs.unlinkSync(req.payload.img.path);

        let img = {
            path: imgPath,
            contentType: req.payload.img.headers['content-type'],
            bytes: req.payload.img.bytes
        };
        delete req.payload.img;
        req.payload['img'] = img;
    }

    //y luego guardamos en la base de datos
    let Category = req.server.plugins.database.mongoose.model('Category');
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

    let Category = req.server.plugins.database.mongoose.model('Category');
    let categorias = null, findOptions = null;
    let scope = req.auth.credentials.scope;

    if (scope === 'guest' || scope === 'user') {
        findOptions = {
            name: true,
            description: true
        };
    }

    if(scope === 'admin'){
        findOptions = {
            'img.bytes': false,
            'img.contentType': false
        };
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

    let Category = req.server.plugins.database.mongoose.model('Category');
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

    let Category = req.server.plugins.database.mongoose.model('Category');

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

exports.delete = async (req, h) => {

    let Category = req.server.plugins.database.mongoose.model('Category');
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

    await fs.unlinkSync(deleted.img.path);

    return { statusCode: 200, data: null };
};

exports.updatePic = async (req, h) => {

    let Category = req.server.plugins.database.mongoose.model('Category');
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
    
    let Category = req.server.plugins.database.mongoose.model('Category');

    try {
        await Category.findByIdAndUpdate(categoryId, { $inc: { productsCount: 1 } });
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }
}

exports.removeProduct = async (req, categoryId) => {
    
    let Category = req.server.plugins.database.mongoose.model('Category');

    try {
        await Category.findByIdAndUpdate(categoryId, { $inc: { productsCount: -1 } });
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }
}