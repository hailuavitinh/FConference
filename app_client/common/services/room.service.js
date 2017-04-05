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
            return $http.post("/api/createToken", data);
        },
        deleteRoom: function(id) {
            return $http.get('/api/rooms/delete/' + id);
        },
        createRoom: function(name) {
            return $http.get('/api/rooms/create/' + name);
        },
        createRoomP: function(name, isPass, password, user) {
            var data = {
                roomID: name,
                isPass: isPass,
                password: password,
                user: user
            };
            return $http.post("/api/rooms/createroom", data);
        },
        updateRoom: function(id, name, isPass, password, user) {
            var data = {
                id: id,
                name: name,
                isPass: isPass,
                password: password,
                user: user
            };
            return $http.post("/api/rooms/update", data);
        },
        getListUser: function(id) {
            return $http.post('/api/rooms/listUser/', { id: id});
        }
    }
}])