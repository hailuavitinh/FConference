(function(){

    angular
        .module('FConf')
        .controller("loginModalCtrl",loginModalCtrl);

    loginModalCtrl.$inject=['$uibModalInstance','authentication','$cookies'];
    function loginModalCtrl($uibModalInstance,authentcation,$cookies){
        var vm = this;
        $('#username').focus();
        vm.modal = {
            cancel:function(){
                $uibModalInstance.dismiss('cancel');
            },
            close:function(result){
                $uibModalInstance.close(result);
            }
        };

        vm.onLogin = function(){
            if(!vm.formData.username || !vm.formData.password){
                vm.formError = "All field required, plese try again";
                return false;
            } else {
                console.log(vm.formData);
                vm.doLogin(vm.formData);
            }
        };

        vm.doLogin = function(data){
            var user = {
                username:data.username,
                password:data.password
            };

            authentcation.login(user).then(function(success){
                console.log('Cookies Access-Token:',$cookies.get('access-token'));
                console.log('Cookies All:',$cookies.getAll());
                authentcation.saveToken(success.data.token);
                vm.modal.close(true);
            },function(err){
                vm.formError = err;
            });
        }

        $('#username').keyup(function(event) {
          if ( event.which == 13 ) {
            $('#password').focus();
          }
        });

        $('#password').keyup(function(event) {
          if ( event.which == 13 ) {
            vm.doLogin();
          }
        });

        
    };//end function loginModalCtrl

})();