const boom = require('boom');
const fs = require('fs');
const path = require('path');

exports.create = async (req, h) => {

    //si hay imagen
    if(req.payload.img){
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

    try{
        var createdCategory = await newCategory.save();
    }catch(error){
        if(error.code == 11000){ return boom.conflict('Ya existe una categoria con ese nombre');}
        return boom.internal('Error al guardar la categoria');
    }
    
    return { statusCode: 201 , data: { category: createdCategory }  };
};

exports.list = async (req, h) => {

    let Category = req.server.plugins.database.mongoose.model('Category');
    let categorias;

    try{
        categorias = await Category.find({}, { name: true, description: true});
    }catch(error){
        return boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: { categories: categorias }};

};

exports.findById = async (req, h) => {

};

exports.update = async (req, h) => {

};

exports.delete = async (req, h) => {

};