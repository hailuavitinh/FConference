(function(){

    angular
    .module('FConf')
    .controller('knockRoomCtrl', knockRoomCtrl);

  knockRoomCtrl.$inject = ['$scope', "$routeParams", '$location','svRooms'];
  function knockRoomCtrl ($scope, $routeParams, $location,svRooms) {
    console.log("Knock Controller");
    var vm = this;
    var roomID = $routeParams.roomID;
    var roomJson;
    var room;
    svRooms.getRoomByID(roomID).then(function(success){
        roomJson = success.data;
        console.log("Room:",roomJson);

         var obj = {roomID: roomJson._id, username: "u3", role: "presenter", isowner: false};
         svRooms.createToken(obj).then(function(success){
            console.log("Token: ",success.data.Token);
            ConnectRoom(success.data.Token);
         });
    });

    function ConnectRoom(token){
         room = Erizo.Room({token: token});
         room.connect();
    }

    vm.knock = function(){
        room.socket.emit('knock',{room:roomJson._id,username:"u3"},function(msg){
             console.log("Received socket:",msg);
         });
    }

  } // end knockCtrl
})();