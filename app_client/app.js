//app.js

(function () {

  angular.module('FConf', ['ngRoute']);

  function config ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/home/home.view.html',
        controller: 'homeCtrl',
        controllerAs: 'vm'
      })
      .when('/r/:roomID', {
        templateUrl: '/home/home.view.html',
        controller: 'homeCtrl',
        controllerAs: 'vm'
      })
      .when('/room/:roomID', {
        templateUrl: '/room/room.view.html',
        controller: 'roomCtrl',
        controllerAs: 'vm'
      })
      .when('/admin/rooms', {
        templateUrl: '/admin/rooms/admin.rooms.view.html',
        controller: 'adminRoomCtrl',
        controllerAs: 'vm'
      })
      // .when('/location/:locationid', {
      //   templateUrl: '/locationDetail/locationDetail.view.html',
      //   controller: 'locationDetailCtrl',
      //   controllerAs: 'vm'
      // })
      // .when('/register', {
      //   templateUrl: '/auth/register/register.view.html',
      //   controller: 'registerCtrl',
      //   controllerAs: 'vm'
      // })
      // .when('/login', {
      //   templateUrl: '/auth/login/login.view.html',
      //   controller: 'loginCtrl',
      //   controllerAs: 'vm'
      // })
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

})();
