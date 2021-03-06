'use strict';

const Boom = require('boom');
const stripeKey = require('../../config/auth').stripe.secretKey;
const Stripe = require('stripe')(stripeKey);
const { newSale } = require('../products/products.controller');

exports.find = async (req, h) => {
    
    let Order = req.server.plugins.db.OrderModel;
    let foundOrders = null;
    let findOptions = {};
    let scope = req.auth.credentials.scope;
    let by = req.query.by;
    let query = req.query.q;

    if (by === undefined && query === undefined && scope === 'user') {
        findOptions = {
            user: req.auth.credentials.id
        }
    }
    if (by === 'user' && scope === 'admin') {
        findOptions = {
            user: query
        }
    }
    else if (by === 'user' && scope === 'user') {
        return Boom.forbidden('Permisos insuficientes');
    }
    if (by === 'id' && scope === 'admin') {
        findOptions = {
            _id: query
        };
    }
    else if (by === 'id' && scope === 'user') {
        findOptions = {
            user: req.auth.credentials.id,
            _id: query
        };
    }
    
    try {
        foundOrders = await Order.find(findOptions)
                                 .populate('user', 'name')
                                 .populate('products.product', 'name description img');
    }
    catch (error) {
        return Boom.internal('Error consultando la base de datos');
    }

    return { statusCode: 200, data: foundOrders.length === 0 ? null : foundOrders };
};

exports.update = async (req, h) => {
    return req.payload;
};

exports.remove = async (req, h) => {
    return req.payload;
};

exports.payWithStripe = async (req, h) => {

    let customer = await Stripe.customers.create({
        email: req.payload.token.email,
        source: req.payload.token.id
    });
    
    let amount = req.payload.order.totalPayment * 100;

    let charge = await Stripe.charges.create({
        amount,
        description: 'simple charge',
        currency: 'usd',
        customer: customer.id
    });

    let Order = req.server.plugins.db.OrderModel;
    let newOrder = new Order(req.payload.order);

    newOrder.user = req.auth.credentials.id;
    newOrder.paymentProcessor = 'stripe';
    newOrder.paymentId = charge.id;

    if (charge.outcome.network_status === 'approved_by_network' &&
        charge.paid === true &&
        charge.status === 'succeeded')
    {
        try {
            newOrder = await newOrder.save();
            newOrder.products.map(async (product) => {
               await newSale(product.product, product.quantity);
            })
        }
        catch (error) {
            return Boom.internal('Error consultando la base de datos');
        }
    }
    
    newOrder = await Order.populate(newOrder, { path: 'products.product', select: 'name description img' });
    
    return { statusCode: 201, data: newOrder };
};

exports.payWithPayPal = async (req, h) => {

}
