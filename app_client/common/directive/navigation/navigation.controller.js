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

        if(!vm.isLoggedIn){
            var auth = $location.search().auth;
            if(auth == false){
                showLoginModal();
            }
        }

        vm.logOut = function(){
            authentication.logout();
            $location.path("/");
        }

        vm.Login = function(){
            showLoginModal();
        } // end vm.Login


        showLoginModal = function(){
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
                    
                    var returnPage = $location.search().returnPage;
                    if(returnPage){
                        $location.path(returnPage).search({auth:null,returnPage:null});    
                    }
                }
            },function(){
                console.log("Login Error");
            })
        }
    }
})();