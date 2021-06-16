'use strict'

var validator = require('validator');
var Article = require('../models/article');
var fs = require('fs');
var path = require('path');

var controller = {
    datosCurso: (req, res) => {
        return res.status(200).send({
            curso: 'Master en frameworks JS',
            autor: 'Rodolfo'
        });
    },
    test: (req, res) => {
        return res.status(200).send({
            message: 'Soy la acción test de mi controlador de articulos'
        });
    },

    save: (req, res) => {
        // Recoger los parametros por post
        var params = req.body;

        // Validar datos (validator)
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_title && validate_content) {
            // Crear objeto a guardar
            var article = new Article();

            // Asignar valores
            article.title = params.title;
            article.content = params.content;
            article.image = null;

            // Guardar el articulo
            article.save();

            // Devolver respuesta
            return res.status(200).send({
                status: 'success',
                article: article
            });
        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son validos'
            });
        }
    },

    getArticles: (req, res) => {

        var query = Article.find({});
        var last = req.params.last;
        if (last || last != undefined) {
            query.limit(5);
            
        }
        // Find, sort -_id es para entregar descendente
        query.sort('-_id').exec((err, articles) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'error al devolver los articulos'
                });
            }

            if (!articles) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos para mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        });
        
    },

    getArticle: (req, res) => {

        // Recoger el id de la url
        var articleId = req.params.id;
        // Comprobar que existe
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el articulo'
            });            
        }

        // Buscar el articulo 
        Article.findById(articleId, (err, article) => {
            if (err || !article) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el articulo'
                });
            }

            // Devolver en json
            return res.status(200).send({
                status: 'success',
                message: article
            })
        });
    },

    update: (req, res) =>{
        // Recoger el id del articulo por la url
        var articleId = req.params.id;

        // Recoger los datos que llegan por put
        var params = req.body;

        // Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }

        if(validate_title && validate_content){
        // Find and update
            Article.findOneAndUpdate({_id: articleId}, params, {new: true}, (err, articleUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    }); 
                }
                if (!articleUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el articulo'
                    });
                }
                // Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
            });
        }else{
            return res.status(200).send({
                status: 'error',
                message: 'La validación no es correcta'
            });
        }
    },

    delete: (req, res) =>{
        // Recoger el id de la url
        var articleId = req.params.id;

        // find and delete
        Article.findByIdAndDelete({_id: articleId}, (err, articleRemoved) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar'
                });
            }
            if (!articleRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No borrado, posiblemente no existe el articulo'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });
        });
    },

    upload: (req, res) =>{
        // Configurar modulo connect multiparty router/article.js
        
        // Recoger el fichero de la peticion
        var file_name = 'Imagen no subida';
        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        // Conoseguir el nombre y la extensiòn del archivo
        var file_path = req.files.file0.path;
        // ADVERTENCIA EN MAC O LINUX, SEPARADOR ES '/', POR LOO QUE VARIABLE SERIA var file_split = file_path.split('/');
        var file_split = file_path.split('\\');
        
        // Nombre del archivo
        var file_name = file_split[2];

        // extension del archivo
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        // Comprobar la extensión, solo imagenes, si no es valida borrar fichero
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif' && file_ext != 'JPG') {
            // borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extension de la imagen no es valida'
                });
            });
        }else{
            // si todo es valido, Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
            var articleId = req.params.id;
            Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new:true}, (err, articleUpdated) => {
                if (err || !articleUpdated) {
                    return res.status(200).send({
                        status: 'error',
                        message: 'Error al guardar la imagen de articulo'
                    });
                }
                
                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
            });
        }
    },

    getImage: (req, res) => {

        var file = req.params.image;
        var path_file = './upload/articles/' + file;

        if (fs.existsSync(path_file)){
            return res.sendFile(path.resolve(path_file));
        }else{
            return res.status(404).send({
                status: 'error',
                message: 'La imagen no existe'
            });
        }
    },

    search: (req, res) =>{

        // Sacar el string a buscar
        var searchString = req.params.search;

        // find or --- si el searchString esta contenido en title o content, lo toma
        Article.find({ "$or": [
            {"title": { "$regex": searchString, "$options": "i"}},
            {"content": { "$regex": searchString, "$options": "i"}},
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                });
            }
            if (!articles || articles.length <= 0 ) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos que coincidan con tu busqueda'
                });
            }
            return res.status(200).send({
                status: 'success',
                articles
            });
        });

        
    }

};

module.exports = controller;