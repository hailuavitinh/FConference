var app = angular.module("FConf");

app.service("svShare",function(){

    var checkEmpty = function(str) {
        if(str === null || str === "" || str === undefined){
          return true;
        }
        return false;
    }
    
    var showLoading = function(isShow, text){
        if(checkEmpty(text))
            text = 'Loading...';
        if(isShow) {
            $('.text-loading').html(text);
            $('.loading').show();
        } else {
            $('.loading').hide();
        }
            
    }    

    return {
    showLoading: showLoading,
    isNullOrEmpty: checkEmpty
    
    };

});