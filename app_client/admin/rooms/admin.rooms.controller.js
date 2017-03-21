(function () {

  angular
    .module('FConf')
    .controller('adminRoomCtrl', adminRoomCtrl);

  adminRoomCtrl.$inject = ['$scope', "svRooms","$location", "svLocalStream", "$route" ];
  function adminRoomCtrl ($scope, svRooms,$location,svLocalStream, $route) {
    
    console.log('adminRoomCtrl controller');

    // Nasty IE9 redirect hack (not recommended)
    if (window.location.pathname !== '/') {
      window.location.href = '/#' + window.location.pathname;
    }
    var vm = this;
    console.log(window.location);    


    var localStream = svLocalStream.getLocalStream();
    if(localStream){
        // console.log("localStream: ",localStream);
        // var track = localStream.stream.getTracks()[0];
        // console.log("Rooms - Track: ",track);
        // track.stop();
        // vm.$apply();
        svLocalStream.setLocalStream(null);
        window.location.reload();
    }

    var localUrl = $location.host()+":"+$location.port();

    vm.localUrl = localUrl+"/#!/";

    svRooms.getRooms().then(function(success){
        console.log("Angular Rooms: ",success);
        vm.rooms = success.data;
    },function(error){
        console.log("API Rooms error: ",error);
    });

    vm.message='rooms Controller';

    vm.deleteRoom = function (roomID) {     
      console.log(roomID);
      var r = confirm("Are you sure?");
      if (r == true) {
          svRooms.deleteRoom(roomID).then(function(success){
              console.log("API Room: ",success);
              alert('delete success');
              $route.reload();
          },function(error){
              console.log("API Room Error: ",error);
              alert('delete fail');
          });
      }      
    };

    vm.createRoom = function() {
      var ro = $('#roomNew').val();
      if(ro == '') {
        alert('Name is empty!');
        return;
      }
      svRooms.createRoom(ro).then(function(success) {
        console.log("API Room: ",success);
        alert('create success');
        $route.reload();
      }, function(error) {
        console.log("API Room Error: ",error);              
        alert('create fail');
      });
            
    };

  }

})();