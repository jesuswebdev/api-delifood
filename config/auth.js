module.exports = {

    'facebookAuth' : {
        'clientID'      : 'your-secret-clientID-here', // your App ID
        'clientSecret'  : 'your-client-secret-here', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '367709789417-8sog1i60db2crb2p5b5c65akm49o70cl.apps.googleusercontent.com',
        'clientSecret'  : '5OQwGdLnlInKPk8ccmz4mcWQ',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};
