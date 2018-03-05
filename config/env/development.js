module.exports = {
    db: 'mongodb://localhost/delivery',
    sessionSecret: 'developmentSessionSecret',
    jwtSecret: 'myJWTdevSecretKey',
    jwtSession: {
    	session: false
    }
};