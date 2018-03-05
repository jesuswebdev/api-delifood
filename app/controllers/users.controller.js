var User = require('mongoose').model('User'),
    passport = require('passport'),
    jwt = require('jwt-simple'),
    config = require('../../config/config');

exports.create = function(req, res, next){
    var user = new User(req.body);

    user.save(function(err){
      if(err){
        return next(err);
      } else {
        res.json(user);
      }
    });
};

exports.list = function(req, res, next){
    User.find({}, function(err, users){
        if(err){
            return next(err);
        } else {
            res.json( { success: true, message: "Usuarios Encontrados", data: users } );
        }
    });
}

exports.read = function(req, res){
    res.json({ success: true, message: "Usuario Encontrado", data: req.user });
};

exports.userByID = function(req, res, next, id){
    User.findOne({
        _id: id
    }, function(err, user){
        if(err){
            return next(err);
        } else {
            req.user = user;
            next();
        }
    });
};

exports.update = function(req, res, next){
    User.findByIdAndUpdate(req.user.id, req.body, function(err, user){
        if(err){
            return next(err);
        } else {
            res.json(user);
        }
    });
};

exports.delete = function(req, res, next){
    req.user.remove(function(err){
        if(err){
            return next(err);
        } else {
            res.json( { success: true, message: "El usuario se elimino con exito" } );
        }
    });
};

exports.signup = function(req, res, next){
  if(!req.user){

    User.findOne({email: req.body.email}, (err, user) => {
      if(err){
        return res.json({ success: false, redirect: '/signup', message: 'singup-error' });
      }//fin if
      else if(user){
        return res.json({ success: false, redirect: '/signup', message: 'singup-error-email-in-use' });
      }//end else if
      else{
        var user = new User(req.body);
        
        user.save((err) => {
          if(err){
            return res.json({success: false, message: 'signup-error'});
          }//end if err
          else{
            let token = jwt.encode({ 'email': user.email }, config.jwtSecret );
            res.json({ success: true, token: 'JWT ' + token, message: 'signup-success', admin: (user.role == 'admin')? true: false, id: user._id });
          }//end else
        });//end user save
      }//end else
    });//end user find one
  } //end if !user.req
  else{
    return res.json({success: false, message: 'user-is-logged-in'});
  }
};

exports.signin = function(req, res, next){

  passport.authenticate('local',

    function(err, user, info){
      if(err){ return next(err); }
      if(!user){
        return res.json({ redirect: '/login', message: 'login-error' });
      }
      let token = jwt.encode({ 'email': user.email }, config.jwtSecret );
      res.json({ success: true, token: 'JWT ' + token, admin: (user.role == 'admin')? true: false, id: user._id });
    }//fin function
    // });

  )(req, res, next);

};

exports.signout = function(req, res, next){
  req.logout();
  res.json({ success: true, message: 'signout-success' });
};

exports.requiresLogin = (req, res, next) => {
  passport.authenticate('jwt', {session: false}, function(err, user, info){
    if(err){ return next(err); }
    if(!user){ return res.json({ "success": false, "message": "authentication-error" }); }
    else { return next(); }
  })(req, res, next);
};

exports.isAdmin = (req, res, next) => {
  passport.authenticate('jwt', {session: false}, function(err, user, info){
    if(err){ return next(err); }
    if(!user){ return res.json({ "success": false, "message": "authentication-error" }); }
    else if(user.role != 'admin'){ res.json({ "success": false, "message": "authorization-error" }); }
    else { return next(); }
  })(req, res, next);
};

exports.hasAuthorization = (req, res, next) => {
  passport.authenticate('jwt', {session: false}, function(err, user, info){
    if(err){ return next(err); }
    if( req.user.role == 'admin '){ return next(); }
    if(!user){ return res.json({ "success": false, "message": "authentication-error" }); }
    else if (req.user.id != user._id){ res.json({ success: false, message: "authorization-error" }); }
    else { return next(); }
  })(req, res, next);
};

//===================================================
//              GOOGLE
//===================================================

exports.googleSignIn = (req, res, next) => {
  passport.authenticate('google', { scope : ['profile', 'email'] })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  passport.authenticate('google',{session:false}, function(err, user, info){
    if(err){return next(err);}
    if(!user){ return res.json({ "success": false, "message": "google-login-error" }); }
    else { res.json({ "success": true, "message": "google-login-success" }); }
  })(req, res, next);

};
