var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var appRoot = require('app-root-path');
var config = require(appRoot+"/configs/config");
var JWT_SECRET = config.getJWT_SECRET();
var auth = jwt({
  secret: JWT_SECRET,
  userProperty: 'payload'
});	

var ctrlRoom = require('../controllers/roomComtroller');
var ctrlAuth = require('../controllers/authentication');

router.post('/api/rooms/', ctrlRoom.getRooms);

//router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
module.exports = router;
