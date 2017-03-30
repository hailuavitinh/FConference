(function () {

  angular
    .module('FConf')
    .service('authentication', authentication);

  authentication.$inject = ['$http', '$window'];
  function authentication ($http, $window) {

    var saveToken = function (token) {
      $window.localStorage['fcon-token'] = token;
    };

    var getToken = function () {
      return $window.localStorage['fcon-token'];
    };

    var isLoggedIn = function() {
      var token = getToken();

      if(token){
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };

    var currentUser = function() {
      if(isLoggedIn()){
        var token = getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        return {
          username : payload.username
        };
      }
    };

    
    login = function(user) {
      return $http.post('/api/login', user);
    }

    logout = function() {
      $window.localStorage.removeItem('fcon-token');
    };

    return {
      currentUser : currentUser,
      saveToken : saveToken,
      getToken : getToken,
      isLoggedIn : isLoggedIn,
      login : login,
      logout : logout
    };
  }


})();