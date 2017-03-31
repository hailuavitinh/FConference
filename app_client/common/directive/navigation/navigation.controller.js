(function(){
    angular.module("FConf")
        .controller("navigationCtrl",navigationCtrl);

    navigationCtrl.$inject = ["$location","authentication","$uibModal"];
    function navigationCtrl($location,authentication,$uibModal){
        var vm = this;

        vm.currentPath = $location.path();
        console.log("vm.currentPath");

        vm.isLoggedIn = authentication.isLoggedIn();
        vm.currentUser = authentication.currentUser();
        vm.isAdmin = authentication.isAdmin();

        vm.logOut = function(){
            authentication.logout();
            $location.path("/");
        }

        vm.Login = function(){
            var modalLogin = $uibModal.open({
                templateUrl:"/loginModal/loginModal.view.html",
                controller:"loginModalCtrl",
                controllerAs: "vm",
                size:"m"
            });

            modalLogin.result.then(function(isLoggedOk){
                if(isLoggedOk){
                    vm.isLoggedIn = authentication.isLoggedIn();
                    vm.currentUser = authentication.currentUser();
                    vm.isAdmin = authentication.isAdmin();
                }
            },function(){
                console.log("Login Error")
            })

        } // end vm.Login

        var _open_left_menu = false;
        vm.leftMenu = function() {            
            if (!_open_left_menu) {
                $('.left-menu').animate({ "margin-left": '+=230' });
                //$('.right-content').css('margin-right', '-230px');
                $('.right-content').animate({ "width": '-=230' });
                _open_left_menu = true;
            } else {
                //$('.right-content').css('margin-right', '0px');
                $('.right-content').animate({ "width": '+=230' });
                $('.left-menu').animate({ "margin-left": '-=230' });
                _open_left_menu = false;
            }
        }
    }
})();