var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var roomSchema = new Schema({
    roomID : mongoose.Schema.Types.ObjectId,
    roomName:String,
    createdBy:String,
    numberOfRoom:Number,
    description:String,
    isPass:Boolean,
    password:String,
    user: String
},{collection:"Rooms"});

var room = mongoose.model("Room",roomSchema);
module.exports = room;