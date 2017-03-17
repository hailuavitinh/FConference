var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});

var ctrlRoom = require('../controllers/roomComtroller');

// reviews
router.post('/rooms/', ctrlRoom.getRooms);

module.exports = router;
