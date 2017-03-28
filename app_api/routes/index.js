var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'JWT_SECRET',
  userProperty: 'payload'
});	

//var ctrlRoom = require('../controllers/roomComtroller');
var ctrlAuth = require('../controllers/authen');

// reviews
//router.post('/api/rooms/', ctrlRoom.getRooms);

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;
