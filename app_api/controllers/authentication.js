var passport = require('passport');
var jwt = require("jsonwebtoken");
var appRoot = require('app-root-path');
var config = require(appRoot+"/configs/config");

//var csrfProtection = csrf({cookie: true});

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var generateJwt = function(dataUser){
  var expiry = new Date();
  expiry.setHours(expiry.getHours()+1);
  var JWT_SECRET = config.getJWT_SECRET();

  return jwt.sign({
    username:dataUser.username,
    permission:dataUser.permission,
    role: dataUser.role || "presenter",
    exp:parseInt(expiry.getTime()/1000)
  },JWT_SECRET)
}

module.exports.login = function(req, res) {
  //console.log("Access Login API:",auth.mLab_User.url);
  if(!req.body.username || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  passport.authenticate('local', function(err, user, info){
    var token;

    console.log("Error login:",err);
    console.log("info login:",info);
    console.log("User login:",user);

    if (err) {
      console.log("Error login");
      sendJSONresponse(res, 404, err);
      return;
    }

    if(user){
      token = generateJwt(user);
      res.status(200);
      res.cookie("access-token",token,{httpOnly:true,secure:true});
      res.cookie("x-xsrf-token",req.csrfToken());
      res.json("OK")
      // sendJSONresponse(res, 200, {
      //   "token" : token
      // });
    } else {
      sendJSONresponse(res, 401, info);
    }
  })(req, res);

};