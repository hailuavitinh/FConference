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

var ctrlRoom = require('../controllers/roomController');
var ctrlAuth = require('../controllers/authentication');



//router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

/* Room Controller */
router.get('/rooms',auth,ctrlRoom.GetRooms);
router.get('/rooms/:id',auth,ctrlRoom.GetRoomById);
router.get('/rooms/create/:id',auth,ctrlRoom.CreateRoomById);
router.post('/rooms/update/',auth,ctrlRoom.UpdateRoom);
router.post('/rooms/setlockroom/',auth,ctrlRoom.SetLockRoom);
router.post('/rooms/createroom/',auth,ctrlRoom.CreateRoom);
router.get('/rooms/delete/:id',auth,ctrlRoom.DeleteRoom);
router.post('/createToken/',auth,ctrlRoom.CreateToken);
router.post('/rooms/listUser/',auth,ctrlRoom.ListUser);
module.exports = router;
