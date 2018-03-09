const boom = require('boom');
const fs = require('fs');
const path = require('path');

exports.create = async (req, h) => {
    //se crea una nueva ruta en la carpeta uploads con el id del usuario
    let userUploadsDir = path.join(req.server.settings.app.uploadsDir, req.auth.credentials.id);

    //verifica si el directorio existe
    let dirExists = await fs.existsSync(userUploadsDir);
    
    //si no existe lo crea
    if(!dirExists){ await fs.mkdirSync(userUploadsDir); }

    //extraemos el nombre de la imagen subida
    let imgPath = await path.basename(req.payload.img.path);

    //creamos un path nuevo para la imagen con el directorio del usuario y el nombre de la imagen
    imgPath = path.join(userUploadsDir, imgPath);

    //movemos la imagen del directorio uploads al directorio del usuario
    await fs.copyFileSync(req.payload.img.path, imgPath);

    //eliminamos la imagen del directorio uploads
    await fs.unlinkSync(req.payload.img.path);

    //y luego guardamos en la base de datos
    let payload = req.payload;

    let Category = req.server.plugins.database.mongoose.model('Category');
    let newCategory = new Category({
        name: payload.name,
        description: payload.description ? payload.description : '',
        img: {
            path: imgPath,
            contentType: payload.img.headers['content-type'],
            bytes: payload.img.bytes
        }
    });

    try{
        var createdCategory = await newCategory.save();
    }catch(e){
        return boom.internal('Error al guardar la categoria');
    }
    console.log(req.payload);

    
    // let path = require('path');
    // let userId = req.auth.credentials.id;
    console.log(req.payload.img.path);
    // let Category = req.server.plugins.database.mongoose.model('Category');
    // let payload = req.payload;
    // let categoria = new Category();

    // categoria.name = payload.name;
    // categoria.description = payload.description;
    // categoria.img.data = await fs.readFileSync(imgPath);
    // categoria.img.contentType = payload.img.headers['content-type'];
    // try{
    //     var categoriaNueva = await categoria.save();
    // }catch(e){
    //     return boom.internal('ERRORRRR');
    // }
    return { statusCode: 201 , data: { category: createdCategory }  };
};

exports.list = async (req, h) => {

};

exports.findById = async (req, h) => {

};

exports.update = async (req, h) => {

};

exports.delete = async (req, h) => {

};