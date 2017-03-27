var app = angular.module("FConf");

app.factory("svRooms",["$http",function($http){
    return {
        getRooms:function(){
            return $http.get("api/rooms");
        },
        getRoomByID: function(roomID){
            return $http.get("/api/rooms/"+roomID);
        },
        createToken : function(data){
            return $http.post("/api/createToken",data);
        },
        deleteRoom: function(id) {
            return $http.get('/api/rooms/delete/' + id);
        },
        createRoom: function(name) {
            return $http.get('/api/rooms/create/' + name);
        },
        getListUser: function(id) {
            return $http.get('/api/rooms/listUser/' + id);
        }
    }
}])