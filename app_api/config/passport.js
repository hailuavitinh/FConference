var passport = require('passport');
var LocalStrategy = require("passport-local");
var request = require("request");
//var mongoose = require('mongoose');
//var User = mongoose.model('User');



passport.use(new LocalStrategy(
  function(username, password, done) {
    /*
    var query = "?q={'username':'"+username+"','pass':'"+password+"'}&fo=true&";
    var path = "https://api.mlab.com/api/1/databases/db_thanhdc/collections/FConf_User" +query+"apiKey=sAWxZ3DyE8JtE3_IrtaN4IuEtiQphe93";
    console.log("quey Mlab:",path);

    var requestOptions = {
      url:path,
      method:"GET",
      json:{}
    };
    request(requestOptions,function(err,responseApi,body){
      if(responseApi.statusCode === 200){
        if(!body){
          return done(null,false,{message:"Login failed"});
        } else {
            return done(null,body);
        }
      } else {
        return done(null,false,{message:err})
      }
    });//end requestOptions*/


    var isAuthenticate = false;
    var user;
    if(username === 'u1'){
      if(password === 'abc@123'){
        isAuthenticate = true;
        user = {
          username: username,
          pass: password,
          permission: 'admin'
        };
      } 
    } else {
      if (username === password){
        isAuthenticate = true;
        user = {
          username: username,
          pass: password
        };
      }
    } 

    if(isAuthenticate == true){
      return done(null,user);
    } else {
      return done(null,false,{message:"Login failed"});
    }
  }
));

