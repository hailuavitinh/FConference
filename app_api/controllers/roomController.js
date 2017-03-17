var Room = require("../models/roomModel");
var abc = require("../models/abcModel");
var appRoot = require('app-root-path');
var N = require(appRoot+"/libs/nuve.js");
var config = require(appRoot+"/config/licode_config");

N.API.init(config.nuve.superserviceID, config.nuve.superserviceKey,  'http://192.168.1.23:3000/'); // //'http://118.69.135.101:3000/'

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
    var res = arguments[4];

    console.log("Access createToken -- RoomID: "+roomID + " - User: "+username + " - Role: "+role);
    N.API.createToken(roomID, username, role, function(token) {
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
    console.log('function createRoom: ', roomID);
    var res = arguments[2];
    N.API.createRoom(roomID, function(resp) {
        console.log(resp);
        //var room= JSON.parse(resp);
        console.log('Room created with id: ', resp._id);
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

module.exports = function(app) {
    app.get("/api/rooms",function(req,res){
        getRooms(function(rooms){
            res.send(rooms);
        },res)
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
        },roomID,res)
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
        },roomID,res)
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
        var roomID = req.body.roomID;
        var username = req.body.username;
        var role = "presenter";
        console.log("API create token - roomID: "+roomID + " - username: "+username);

        if(checkStringNullOrEmty(roomID) || checkStringNullOrEmty(username)){
            res.status(503).send("Please check roomID or username.  !!!")
        } else {
            createToken(function(token){
                if(token == null || token == undefined ){
                    res.status(500).send(JSON.stringify({error:"The Erizo have problem."}));
                }
                res.send(JSON.stringify({Token:token})); 
            },roomID,username,role,res);
        }
    });



}