(function () {

  angular
    .module('FConf')
    .controller('roomCtrl', roomCtrl);

  roomCtrl.$inject = ['$scope', "$timeout", "$routeParams", "svRooms", "svLocalStream"];
  function roomCtrl ($scope, $timeout, $routeParams, svRooms, svLocalStream) {
    
    console.log('room controller');

    // Nasty IE9 redirect hack (not recommended)
    if (window.location.pathname !== '/') {
      window.location.href = '/#' + window.location.pathname;
    }
    var vm = this;
    console.log(window.location);    

  }

})();