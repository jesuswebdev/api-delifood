'use strict';

const Lab = require('lab');
const Code = require('code');

const server = require('../../server');

const { ADMIN_TOKEN, GUEST_TOKEN, USER_TOKEN } = require('../config');

const lab = (exports.lab = Lab.script());

const experiment = lab.experiment;
const test = lab.test;
const expect = Code.expect;

experiment('GET Request to -> /api/users:', () => {
    
    test('No token, expect: 401 [Unauthorized] & WWW-Authenticate: Bearer', async () => {

        let options = {
            url: '/api/users',
            method: 'get'
        }

        const response = await server.inject(options);
        
        expect(response.statusCode).to.be.equal(401);
        expect(response.headers).to.contain('www-authenticate');
        expect(response.headers['www-authenticate']).to.be.equal('Bearer');
    });

    test('User token, expect: 403 [Forbidden]', async () => {

        let options = {
            url: '/api/users',
            method: 'get',
            headers: {
                'Authorization': `Bearer ${USER_TOKEN}`
            }
        }

        const response = await server.inject(options);
        expect(response.statusCode).to.be.equal(403);
    });

    test('Guest token, expect: 403 [Forbidden]', async () => {

        let options = {
            url: '/api/users',
            method: 'get',
            headers: {
                'Authorization': `Bearer ${GUEST_TOKEN}`
            }
        }

        const response = await server.inject(options);
        expect(response.statusCode).to.be.equal(403);

    });

    test('Admin token, expect: 200 [OK] & array of users', { timeout: 5000 }, async () => {

        let options = {
            url: '/api/users',
            method: 'get',
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            }
        }

        const response = await server.inject(options);
        expect(response.statusCode).to.be.equal(200);
        expect(response.result.data).to.be.an.array();

    });

    test('Malformed token, expect: 400 [Bad Request]', async () => {

        let options = {
            url: '/api/users',
            method: 'get',
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}123`
            }
        }

        const response = await server.inject(options);
        expect(response.statusCode).to.be.equal(400);
    });

    test('URL params, expect: 400 [Bad Request]', async () => {

        let options = {
            url: '/api/users?id=123',
            method: 'get',
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            }
        }

        const response = await server.inject(options);
        expect(response.statusCode).to.be.equal(400);
    });
});
