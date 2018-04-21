'use strict';

const Lab = require('lab');
const Code = require('code');

const server = require('../../server');

const { ADMIN_TOKEN, GUEST_TOKEN, USER_TOKEN } = require('../config');

const lab = (exports.lab = Lab.script());

const experiment = lab.experiment;
const test = lab.test;
const expect = Code.expect;

lab.beforeEach(async ()=>{

});

experiment('GET /api/users', () => {

    
});
