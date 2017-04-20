var Room = require("../models/roomModel");
//var abc = require("../models/abcModel");
var appRoot = require('app-root-path');
var N = require(appRoot+"/libs/nuve_unminify.js");
var config = require(appRoot+"/configs/licode_config");
var crypto = require('crypto');

N.API.init(config.nuve.superserviceID, config.nuve.superserviceKey, 'http://118.69.135.101:3000/' ); // ////'http://192.168.1.24:3000/'

// var getRoomsFromNuve = function(res,callback){
//     N.API.getRooms(function(roomList){
//         var rooms = JSON.parse(roomList);
//         callback(res,rooms);
//     },errCallBackNuve(res))
// };

var checkStringNullOrEmty = function(a){
    if(a === null || a === "" || a === undefined){
        return true;
    } else {
        return false;
    }
}

var getRooms = function(callback){
    var res = arguments[1];
    N.API.getRooms(function(roomList){
        var rooms = JSON.parse(roomList);
        console.log("rooms: ",rooms);
        callback(rooms);
    },function(err){
        console.log("Error Nuve",err);
        res.status(404).send(err);
    });
}

var getRoomByID = function(callback){
    var roomID = arguments[1];
    console.log("function getRoomByID: ",roomID);
    var res = arguments[2];
    N.API.getRoom(roomID, function(resp) {
        var room= JSON.parse(resp);
        console.log('Room name: ', room.name);
         callback(room);
    }, function(err){
        console.log("Error Nuve",err);
        res.status(404).send(err);
    });
}


var createToken = function (callback){
    var roomID = arguments[1];
    var username = arguments[2];
    var role = arguments[3];
    var isowner = arguments[4];
    var res = arguments[5];

    console.log("Access createToken -- RoomID: "+roomID + " - User: "+username + " - Role: "+role + " - Isowner: " + isowner);
    N.API.createToken(roomID, username, role, isowner, function(token) {
        console.log("token: ",token);
        callback(token);
    },function(err){
        console.log("Token Error: ",err);
        res.status(503).send(err);
    })
}

var errCallBackNuve = function(res,err){
    console.log("Error Nuve",err);
}

var getRoomsFromFConf= function(res,roomList){
    console.log("Access getRoomssss");
    Room.find(function(err,result){
        if (err){
            res.status(404).send("FConf DB has a error. Error: ",err);
        } else{
            res.send(result);
        }
    });
}

var createRoom = function (callback) {
    var roomID = arguments[1];
    var isPass = arguments[2] || false;
    var password = arguments[3] || '';
    var user = arguments[4];
    var res = arguments[5];

    console.log('function createRoom: ', roomID);
    
    if(roomID == null || roomID == undefined){
        
    }
    if(password !== '' && password !== undefined) {
        password = crypto.createHash('md5').update(password).digest('hex');
    }
    
    N.API.createRoom(roomID, function(resp) {
        console.log(resp);
        //var room= JSON.parse(resp);
        console.log('Room created with id: ', resp._id);
        callback(resp);
    }, function(err){
        console.log("Error Nuve",err);
        res.status(404).send(err);
    },  {data: {isPass: isPass, password: password, user: user}});
}

var updateRoom = function (callback) {
    var roomID = arguments[1];
    var name = arguments[2];
    var isPass = arguments[3] || false;
    var password = arguments[4] || '';
    var user = arguments[5];
    var res = arguments[6];

    console.log('function createRoom: ', roomID);
    
    if(roomID == null || roomID == undefined){
        
    }
    if(password !== '' && password !== undefined) {
        password = crypto.createHash('md5').update(password).digest('hex');
    }
    
    N.API.updateRoom(roomID, name, function(resp) {
        console.log(resp);
        //var room= JSON.parse(resp);
        console.log('Room update with id: ', resp._id);
        callback(resp);
    }, function(err){
        console.log("Error Nuve",err);
        res.status(404).send(err);
    },  {data: {isPass: isPass, password: password, user: user}});
}

var setLockRoom = function (callback) {
    var roomID = arguments[1];
    var islock = arguments[2];    
    var res = arguments[3];

    console.log('function setlockRoom: ', roomID);
    
    if(roomID == null || roomID == undefined){
        
    }   
    
    
    N.API.setLockRoom(roomID, islock, function(resp) {
        console.log(resp);
        //var room= JSON.parse(resp);
        console.log('Room update with id: ', resp._id);
        callback(resp);
    }, function(err){
        console.log("Error Nuve",err);
        res.status(404).send(err);
    });
}

var deleteRoom = function (callback) {
    var roomID = arguments[1];
    console.log('function deleteRoom: ', roomID);
    var res = arguments[2];
    N.API.deleteRoom(roomID, function(resp) {        
        console.log('Room delete result: ', resp);
        callback(resp);
    }, function(err){
        console.log("Error Nuve",err);
        res.status(404).send(err);
    });
}

var getUserInRoom = function(callback) {
    var roomID = arguments[1];
    var res = arguments[2];

    N.API.getUsers(roomID, function(resp) {
      console.log(' >>>>> getlist user');
      var usersList = JSON.parse(resp);
      console.log('This room has ', usersList.length, 'users');
      callback(usersList);

    }, function(err){
        console.log("Error Nuve",err);
        res.status(404).send(err);
    });

}

module.exports = function(app) {
    app.get("/api/rooms",function(req,res){
        getRooms(function(rooms){
            res.send(rooms);
        },res);
    });

    app.get("/api/rooms/:id",function(req,res){
        var roomID = req.params.id;
        console.log("Acess API rooms/:id ",roomID);
        getRoomByID(function(room){
            if(room == null || room == undefined){
                res.status(404).send("Room doesn't have exists. Please check again !!");
            } else{
                res.send(room);
            }
        },roomID,res);
    });

    app.get("/api/rooms/create/:id",function(req,res){
        var roomID = req.params.id;
        console.log("Acess API createroom/:id ",roomID);
        createRoom(function(room){
            if(room == null || room == undefined){
                res.status(404).send("Room doesn't have exists. Please check again !!");
            } else{
                res.send(room);
            }
        },roomID,res);
    });

    app.post("/api/rooms/update/",function(req,res){
        var roomID = req.body.id;
        var name = req.body.name;
        var isPass = req.body.isPass;
        var password = req.body.password;
        var user = req.body.user;
        console.log("Acess API updateroom/ ",roomID);
        updateRoom(function(room){
            if(room == null || room == undefined){
                res.status(404).send("Room doesn't have exists. Please check again !!");
            } else{
                res.send(room);
            }
        },roomID, name, isPass, password, user, res);
    });

    app.post("/api/rooms/setlockroom/",function(req,res){
        var roomID = req.body.id;
        var islock = req.body.islock;
        console.log("Acess API setlockroom/ ",roomID);
        setLockRoom(function(room){
            if(room == null || room == undefined){
                res.status(404).send("Room doesn't have exists. Please check again !!");
            } else{
                res.send(room);
            }
        },roomID, islock, res);
    });

    app.post("/api/rooms/createroom/",function(req,res){
        var roomID = req.body.roomID;
        var isPass = req.body.isPass;
        var password = req.body.password;
        var user = req.body.user;
        console.log("Acess API createroom ",roomID);
        createRoom(function(room){
            if(room == null || room == undefined){
                res.status(404).send("Room doesn't have exists. Please check again !!");
            } else{
                res.send(room);
            }
        },roomID, isPass, password, user, res);
    });

    app.get("/api/rooms/delete/:id",function(req,res){
        var roomID = req.params.id;
        console.log("Acess API deleteRoom/:id ",roomID);
        deleteRoom(function(result){
            if(result == null || result == undefined){
                res.status(404).send("Room doesn't have exists. Please check again !!");
            } else{
                res.send(result);
            }
        },roomID,res)
    });

    app.post("/api/createToken",function(req,res){
        console.log("Requets Body: ",req.body);
        var roomID = req.body.roomID;
        var username = req.body.username;
        var role = req.body.role || "presenter"; //presenter - viewer - viewerWithData
        var isOwner = req.body.isowner || false;
        console.log("Requets Body -- isOwner: ",isOwner);
        console.log("API create token - roomID: "+roomID + " - username: "+username);

        if(checkStringNullOrEmty(roomID) || checkStringNullOrEmty(username)){
            res.status(503).send("Please check roomID or username.  !!!")
        } else {
            createToken(function(token){
                if(token == null || token == undefined ){
                    res.status(500).send(JSON.stringify({error:"The Erizo have problem."}));
                }
                res.send(JSON.stringify({Token:token})); 
            },roomID,username,role,isOwner,res);
        }
    });

    app.post("/api/rooms/listUser",function(req,res){
        var roomID = req.body.id;
        getUserInRoom(function(users){                  
            res.send(users);
        }, roomID, res);
    });

}