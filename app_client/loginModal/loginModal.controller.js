(function(){

    angular
        .module('FConf')
        .controller("loginModalCtrl",loginModalCtrl);

    loginModalCtrl.$inject=['$uibModalInstance'];
    function loginModalCtrl($uibModalInstance){
        var vm = this;
        vm.modal = {
            cancel:function(){
                $uibModalInstance.dismiss('cancel');
            },
            close:function(){
                $uibModalInstance.close(result);
            }
        };


        
    };//end function loginModalCtrl

})();