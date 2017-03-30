//app.js

(function () {

  angular.module('FConf', ['ngRoute','ui.bootstrap']);

  function config ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/home/home.view.html',
        controller: 'homeCtrl',
        controllerAs: 'vm'
      })
      .when('/room/:roomID', {
        templateUrl: '/room/room.view.html',
        controller: 'roomCtrl',
        controllerAs: 'vm',
        isAuthentication:true
      })
      .when('/admin/rooms', {
        templateUrl: '/admin/rooms/admin.rooms.view.html',
        controller: 'adminRoomCtrl',
        controllerAs: 'vm',
        isAdmin: true
      })
      .otherwise({redirectTo: '/'});

    // use the HTML5 History API    
 	//$locationProvider.html5Mode({
	//   enabled: true,
	//   requireBase: false
	// });
  }

  angular
    .module('FConf')
    .config(['$routeProvider', '$locationProvider', config]);

   angular.module('FConf')
      .run(['$rootScope','$location','authentication','$uibModal',authRoute]);

  function authRoute($rootScope,$location,authentication,$uibModal){
    $rootScope.$on("$routeChangeStart",function(event,next,current){
      if(next.$$route.isAdmin){
        var isAdmin = authentication.isAdmin();
        if(!isAdmin){
          $location.path("/");
        }
      }

      if(next.$$route.isAuthentication){
        var isLogged = authentication.isLoggedIn();
        if(!isLogged){
          console.log("Location Path:",$location.path());
          var returnUrl = $location.path();
          $location.path("/").search({auth:false,returnPage:returnUrl});
        }
      }
    });
  } //end authRoute

  


})();
