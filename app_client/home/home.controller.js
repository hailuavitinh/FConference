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
 
  }

})();