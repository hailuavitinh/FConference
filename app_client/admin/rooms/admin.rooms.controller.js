(function () {

  angular
    .module('FConf')
    .controller('adminRoomCtrl', adminRoomCtrl);

  adminRoomCtrl.$inject = ['$scope', "svRooms","$location", "svLocalStream", "$route", "svShare" ];
  function adminRoomCtrl ($scope, svRooms,$location,svLocalStream, $route, svShare) {
    
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

      alertify.confirm('Delete room?', 'Are you sure?', function(){ 
        svRooms.deleteRoom(roomID).then(function(success){
              console.log("API Room: ",success);
              alertify.alert('Delete Room', 'Delete room successful!', function(){ $route.reload(); });
              
          },function(error){
              console.log("API Room Error: ",error);
              alertify.error('Delete fail: ' + error);
          });
      }, function(){ });
      
    };

    vm.createRoom = function() {
      var ro = $('#roomNew').val();
      var us = $('#user').val();

      if(svShare.isNullOrEmpty(ro)) {
        alert('Name is empty!');
        return;
      }

      if(svShare.isNullOrEmpty(us)) {
        alert('User is empty!');
        return;
      }

      var isPass = $('#isPass:checked').val();
      var pass = '';
      
      if(isPass !== undefined) {
        isPass = true;
        pass = $('#password').val();
        if(svShare.isNullOrEmpty(pass)) {
          alert('Password is empty!');
          return;
        }

      } else {
        isPass = false;
        pass = '';
      }

      // svRooms.createRoom(ro).then(function(success) {
      //   console.log("API Room: ",success);
      //   alert('create success');
      //   $route.reload();
      // }, function(error) {
      //   console.log("API Room Error: ",error);              
      //   alert('create fail');
      // });

      svRooms.createRoomP(ro, isPass, pass, us).then(function(success) {
        console.log("API Room: ",success);
        alertify.alert('Create Room', 'Create room successful!', function() { $route.reload(); });        
      }, function(error) {
        console.log("API Room Error: ",error);              
        alertify.error('Create fail: ' + error);
      });
            
    };
    var current_roomid = '';
    vm.updateRoom = function(roomID) {
      $('#e_name').val('');
      $('#e_user').val('');
      $('#e_isPass').prop("checked", false);
      $('#e_password').val('');

      if(svShare.isNullOrEmpty(roomID)) {
        alertify.warning("Invalid Room");
        retrun;
      }
      current_roomid = roomID;
      svShare.showLoading(true);
      svRooms.getRoomByID(roomID).then(function(data) {
        $('#e_name').val(data.data.name);
        $('#e_isPass').prop("checked",data.data.isPass );
        $('#e_user').val(data.data.user);        
        
        svShare.showLoading(false);

        $('#e_update').modal('show');
      },function(error){
            svShare.showLoading(false);
            console.log("API Room Error: ",error);
            alertify.error('Load fail: ' + error);
      });
      
    }

   vm.saveUpdate = function () {
      if(svShare.isNullOrEmpty(current_roomid)) {
        alert('Invalid Room!');
        return;
      }
      var ro = $('#e_name').val();
      var us = $('#e_user').val();

      if(svShare.isNullOrEmpty(ro)) {
        alert('Name is empty!');
        return;
      }

      if(svShare.isNullOrEmpty(us)) {
        alert('User is empty!');
        return;
      }

      var isPass = $('#e_isPass:checked').val();
      var pass = '';
      
      if(isPass !== undefined) {
        isPass = true;
        pass = $('#e_password').val();
        if(svShare.isNullOrEmpty(pass)) {
          alert('Password is empty!');
          return;
        }
      } else {
        isPass = false;
        pass = '';
      }
       svShare.showLoading(true);
       svRooms.updateRoom(current_roomid, ro, isPass, pass, us).then (function(success) {
        svShare.showLoading(false);
        $('#e_update').modal('hide');
        console.log("API Room: ",success);
          alertify.alert('Update Room', 'Update room successful!', function(){ $route.reload(); });
       },function(error){
          svShare.showLoading(false);
          console.log("API Room Error: ",error);
          alertify.error('Update fail: ' + error);
        });

    }
  }

 

})();