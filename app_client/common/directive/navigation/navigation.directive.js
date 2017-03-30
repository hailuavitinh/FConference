(function(){
    angular.module('FConf')
        .directive("navigation",navigation);

    function navigation(){
        return{
            restrict:"EA",
            templateUrl:"/common/directive/navigation/navigation.template.html",
            controller:"navigationCtrl as navvm"
        }
    }
})();