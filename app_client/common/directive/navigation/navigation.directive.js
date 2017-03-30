(function(){
    angular.module('FConf')
        .directive("navigation",navigation);

    function navigation(){
        return{
            restrict:"EA",
            templateUrl:"/common/directive/navigation/navigation.template.html",
            controller:"navigationCtrl as navvm", 
            link: function(scope, element){ 
		      
		      		//$(window).load(function() {
		                var main_height = $(window).height() - $('.header').outerHeight() - $('.footer').outerHeight() - 5;
		        		console.log($(window).height(),$('.header').outerHeight(),$('.footer').outerHeight(), main_height);
				        $('.body-content').height(main_height);
				        
				        var mid = $('.body-content').height()/2 - 40;        
				        console.log(mid);
				        $('.main-link').css("padding-top", mid + 'px');
				    // });
		       }
        }
    }
})();