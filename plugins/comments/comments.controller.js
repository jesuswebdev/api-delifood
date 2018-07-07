'use strict';

const Boom = require('boom');
const productsController = require('../products/products.controller');
const Comment = require('mongoose').model('Comment');

exports.create = async (req, h) => {

    let newComment;

    try {

        let existingComment = await Comment.find({ user: req.payload.user, product: req.payload.product });
        if (existingComment.length > 0) {
            return Boom.conflict('Ya hiciste un comentario en este producto');
        }
        
        newComment = new Comment(req.payload);
        await newComment.save();
        await productsController.addNewComment(newComment.product, newComment.rating);
    }
    catch (err) {
        return Boom.internal('Error al intentar crear un nuevo comentario');
    }

    newComment = await Comment.populate(newComment, { path: 'user', select: 'name' });

    return { statusCode: 200, data: newComment };
};

exports.find = async (req, h) => {

    let foundComments = null;
    let skip = req.query.offset || false;
    let limit = req.query.limit || false;

    if (req.query.by === 'product') {

        try {
            foundComments = await Comment.find({ product: req.query.q })
                                         .skip(skip)
                                         .limit(limit)
                                         .populate('user', 'name');
        }
        catch (err) {
            return Boom.internal('Error consultando comentarios');
        }
    }

    return { statusCode: 200, data: foundComments };
};

exports.update = async (req, h) => {
};

exports.remove = async (req, h) => {
};
