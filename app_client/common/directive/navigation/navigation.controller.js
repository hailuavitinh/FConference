(function(){
    angular.module("FConf")
        .controller("navigationCtrl",navigationCtrl);

    navigationCtrl.$inject = ["$location","authentication","$uibModal","svLocalStream", "svShare"];
    function navigationCtrl($location,authentication,$uibModal,svLocalStream, svShare){
        var vm = this;

        vm.currentPath = $location.path();
        console.log("vm.currentPath",vm.currentPath);
        var stream = svLocalStream.getLocalStream();
        if(stream){
            console.log("-----------Access Camera----------");
            window.location.reload();
        }
        
        vm.isNotShowMenu = false;
        vm.isLoggedIn = authentication.isLoggedIn();
        vm.currentUser = authentication.currentUser();
        vm.isAdmin = authentication.isAdmin();
        
        if( vm.currentPath == "/") {
            vm.isNotShowMenu = true;
        }

        function showLoginModal(){
            
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
                console.log("Login Error")
            })
        } // end function showLoginModal

        console.log("--Logged In--:",vm.isLoggedIn);
        if(!vm.isLoggedIn){
            var auth = $location.search().auth;
            if(auth === "false" || auth === false){
                showLoginModal();
            }
        }

        vm.readNotify = function() {
            svShare.readNotify();
        }

        vm.clearNotify = function() {
            svShare.clearNotify();
        }

        vm.logOut = function(){
            authentication.logout();
            $location.path("/");
        }

        vm.Login = function(){
            showLoginModal();
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