(function(){

    angular
        .module('FConf')
        .controller("loginModalCtrl",loginModalCtrl);

    loginModalCtrl.$inject=['$uibModalInstance','authentication'];
    function loginModalCtrl($uibModalInstance,authentcation){
        var vm = this;
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
                authentcation.saveToken(success.data.token);
                vm.modal.close(true);
            },function(err){
                vm.formError = err;
            });
        }

        
    };//end function loginModalCtrl

})();