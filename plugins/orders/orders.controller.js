'use strict';

const Boom = require('boom');

exports.create = async (req, h) => {

    let Order = req.server.plugins.db.OrderModel;
    let newOrder = new Order(req.payload);

    newOrder.user = req.auth.credentials.id;

    try {
        newOrder = await newOrder.save();
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 201, data: newOrder.id };
};

exports.list = async (req, h) => {
    
    let Order = req.server.plugins.db.OrderModel;
    let foundOrders = null;
    let findOptions = {};
    let scope = req.auth.credentials.scope;

    if (scope === 'user') {
        findOptions = {
            user: req.auth.credentials.id
        };
    }

    try {
        foundOrders = await Order.find(findOptions)
                                 .populate('user', 'name')
                                 .populate('products.product', 'name');
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: foundOrders };
};

exports.findById = async (req, h) => {
    
    let Order = req.server.plugins.db.OrderModel;
    let foundOrder = null;

    try {
        foundOrder = await Order.findById(req.params.id)
                                .populate('user', 'name')
                                .populate('products.product','name');
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    if (req.auth.credentials.scope === 'user' &&
        foundOrder.user.id != req.auth.credentials.id) {

        foundOrder = null;
    }

    return { statusCode: 200, data: foundOrder };
};

exports.update = async (req, h) => {
    return req.payload;
};

exports.remove = async (req, h) => {
    return req.payload;
};