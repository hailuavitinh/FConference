(function () {

  angular
    .module('FConf')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['$scope', "$routeParams", '$location','$uibModal'];
  function homeCtrl ($scope, $routeParams, $location,$uibModal) {
    
    console.log('home controller');


    // Nasty IE9 redirect hack (not recommended)
    if (window.location.pathname !== '/') {
      window.location.href = '/#' + window.location.pathname;
    }
    var vm = this;
    console.log(window.location);
    
    var roomID = $routeParams.roomID;
    if(roomID !== undefined) 
      $('#roomID').val(roomID);


    vm.Join = function() {
      var rid = $('#roomID').val();

      if(rid === null || rid === "" || rid === undefined){
           alertify.error('Please enter RoomID');
       } else {
          $location.url('/room/' + rid);
       }
    }// end vm.Join


    vm.Login = function(){
      var modalLogin = $uibModal.open({
        templateUrl:"/loginModal/loginModal.view.html",
        controller:"loginModalCtrl",
        controllerAs: "vm",
        size:"m"
      });
    }//end vm.Login
      
    DetectHasCamera_Audio_Speaker(function(result){
        console.log("Device Kind: ",result);
        if(!result.IsEnumerateDevices){
            alertify.alert(result.content);
        }
    });

    function DetectHasCamera_Audio_Speaker(callback){
      var result = {IsEnumerateDevices: false,IsAudio: false,IsSpeaker:false,IsCamera:false,content:""};
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            result.content = "Please switch Chorme or FireFox browser to use this function !";
            callback(result);
      }
      result.IsEnumerateDevices = true;

      navigator.mediaDevices.enumerateDevices().then(function(devices){
          devices.forEach(function(itemDevice){
              if(itemDevice.kind === "audioinput"){
                  result.IsAudio = true;
              }
              
              if(itemDevice.kind === "videoinput"){
                  result.IsCamera = true;
              }

              if(itemDevice.kind === "audiooutput"){
                  result.IsSpeaker = true;  
            }
          });
          callback(result);
      }).catch(function(err) {
          result.IsEnumerateDevices = false;
          result.content = "Error: " + err.name + " - " + err.message;
          callback(result);
      });
    }
  }

})();