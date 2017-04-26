var app = angular.module("FConf");

app.factory("svRooms",["$http","authentication",function($http,authentication){
    return {
        getRooms:function(){
            return $http.get("api/rooms",{
                headers:{
                    Authorization:'Bearer '+ authentication.getToken()
                }
            });
        },
        getRoomByID: function(roomID){
            return $http.get("/api/rooms/"+roomID,{
                headers:{
                    Authorization:'Bearer '+ authentication.getToken()
                }
            });
        },
        createToken : function(data){
            return $http.post("/api/createToken", data,{
                headers:{
                    Authorization:'Bearer '+ authentication.getToken()
                }
            });
        },
        deleteRoom: function(id) {
            return $http.get('/api/rooms/delete/' + id,{
                headers:{
                    Authorization:'Bearer '+ authentication.getToken()
                }
            });
        },
        createRoom: function(name) {
            return $http.get('/api/rooms/create/' + name,{
                headers:{
                    Authorization:'Bearer '+ authentication.getToken()
                }
            });
        },
        createRoomP: function(name, isPass, password, user) {
            var data = {
                roomID: name,
                isPass: isPass,
                password: password,
                user: user
            };
            return $http.post("/api/rooms/createroom", data,{
                headers:{
                    Authorization:'Bearer '+ authentication.getToken()
                }
            });
        },
        updateRoom: function(id, name, isPass, password, user) {
            var data = {
                id: id,
                name: name,
                isPass: isPass,
                password: password,
                user: user
            };
            return $http.post("/api/rooms/update", data,{
                headers:{
                    Authorization:'Bearer '+ authentication.getToken()
                }
            });
        },
        setLockRoom: function(islock, id) {
            var data = {
                islock: islock,
                id: id
            };
            return $http.post("/api/rooms/setLockRoom", data,{
                headers:{
                    Authorization:'Bearer '+ authentication.getToken()
                }
            });
        },
        getListUser: function(id) {
            return $http.post('/api/rooms/listUser/', { id: id},{
                headers:{
                    Authorization:'Bearer '+ authentication.getToken()
                }
            });
        }
    }
}])