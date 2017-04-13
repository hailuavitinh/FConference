// JavaScript source code
(function () {

    angular
    .module('FConf')
    .controller('roomCtrl', roomCtrl);

    roomCtrl.$inject = ['$scope', "$timeout", "$routeParams", "svRooms", "svLocalStream", "svShare", "$location", "authentication"];
    function roomCtrl($scope, $timeout, $routeParams, svRooms, svLocalStream, svShare, $location, authentication) {

        console.log('room controller');

        // Nasty IE9 redirect hack (not recommended)
        if (window.location.pathname !== '/') {
            window.location.href = '/#' + window.location.pathname;
        }
        var vm = this;
        vm.UsersKnock = [];

        var screen_stream, localStream;
        svShare.showLoading(true, 'Join room');

        vm.my = { isShowVideoConfernce: false, isShowError: false, isShowEnterUserName: true, isShowShareScreen: false, isShowButtonShareScreen: false };
        vm.ListUser = [];
        var roomID = $routeParams.roomID;

        console.log("Angular Join: ", roomID);

        var username = 'u' + Math.floor(Math.random() * 1000000000);
        var role = "presenter";
        vm.currentUser = [];
        var isOwner = false;

        if (authentication.isLoggedIn()) {
            vm.currentUser = authentication.currentUser();
            username = vm.currentUser.username;
            role = vm.currentUser.role || "presenter";
        }

        vm.AllowJoinRoom = function (isAllow, socketid) {
            if (isAllow == 1) {
                room.socket.emit('allowJoinRoom', { socket: socketid, isAllow: true });
            } else {
                room.socket.emit('allowJoinRoom', { socket: socketid, isAllow: false });
            }

            for (var index = 0; index < vm.UsersKnock.length; index++) {
                var element = vm.UsersKnock[index];
                if (element.socket === socketid) {
                    vm.UsersKnock.splice(index, 1);
                    break;
                }
            }// end for loop
        }

        svRooms.getRoomByID(roomID).then(function (success) {

            console.log("API Room: ", success);
            svShare.showLoading(false);
            vm.roomJson = success.data;
            console.log("------- Room JSON: ---", vm.roomJson);
            if (username == vm.roomJson.user) {
                isOwner = true;
            }
            
            askJoinPassword(success.data.isPass);

        }, function (error) {
            console.log("API Room Error: ", error);
            svShare.showLoading(false);
            alertify.error("Connect room fail: " + error.data);
            alert('Room Error: ' + error.data);
            vm.error = error.data;

            $location.url('/#');
        });

        function askJoinPassword(isask) {
            if (isask) {
                $("#askPassword").modal('show');

            } else {

                // if(vm.roomJson.islock) {
                //   alertify.alert('While accept', '<i class="fa fa-spinner fa-spin fa-fw"></i> Room locked. Please while accept from admin');

                //   return;
                // }

                alertify.success("Connect room successful");
                console.log("User name", username);
                connectRoom(vm.roomJson._id, username); //get user name from authen service
                svShare.showLoading(false);

                LoadListUser();
            }
        }

        function connectRoom(roomID, username) {

            svShare.showLoading(true, 'Join room');
            if (svShare.isNullOrEmpty(username)) {
                alertify.error("User in empty!");
                //redirect to home 
                vm.my.isShowVideoConfernce = false;
                return;
            }
            if (svShare.isNullOrEmpty(roomID)) {
                alertify.error("This room not exists!");
                //redirect to home
                vm.my.isShowVideoConfernce = false;
                return;
            } else {
                var obj = { roomID: vm.roomJson._id, username: username, role: role, isowner: isOwner };

                svRooms.createToken(obj).then(function (success) {
                    console.log("Token: ", success);
                    console.log(" InitLocalStream RoomID: ", vm.roomJson._id);
                    console.log(" InitLocalStream Token: ", success.data.Token);
                    console.log("token decode:", L.Base64.decodeBase64(success.data.Token));
                    DetectHasCamera_Audio_Speaker(function (result) {
                        //result.IsSpeaker = false;
                        console.log("Device Kind: ", result);
                        if (result.IsEnumerateDevices) {

                            vm.my.isShowVideoConfernce = true;
                            vm.my.isShowButtonShareScreen = true;

                            $scope.$apply();
                            InitLocalStream(username, vm.roomJson._id, success.data.Token, result.IsSpeaker, result.IsCamera);
                            svShare.showLoading(false);
                        } else {
                            svShare.showLoading(false);
                            vm.error = result.content;
                            alertify.error(result.content);
                            //vm.my.isShowError = true;
                            vm.my.isShowVideoConfernce = false;
                            $scope.$apply();
                        }
                    })
                }, function (error) {
                    svShare.showLoading(false);
                    vm.error = error.data;
                    console.log(error.data);
                    alertify.error(error.data);

                    setTimeout(function () { $scope.$apply(); }, 1500);
                });
            }
        }

        vm.verify = function () {

            var pass = $('#passToJoin').val();
            if (svShare.isNullOrEmpty(pass)) {
                alertify.warning('Please enter password!');
                return;
            }
            if (svShare.md5(pass) == vm.roomJson.password) {
                $("#askPassword").modal('hide');

                // if(vm.roomJson.islock) {
                //   alertify.alert('While accept', '<i class="fa fa-spinner fa-spin fa-fw"></i> Room locked. Please while accept from admin');
                //   return;
                // }
                alertify.success("Connect room successful");
                connectRoom(vm.roomJson._id, username); //get user name from authen service
                svShare.showLoading(false);
                LoadListUser();

            } else {
                alertify.error('You dont have permisstion!');
                return;
            }
        }

        vm.setLock = function () {
            if (isOwner) {
                var title = 'Lock Room';
                var mess = 'Do you want to lock this room!';

                if (vm.roomJson.islock) {
                    title = "Unlock Room";
                    mess = 'Do you want to unlock this room!';
                }

                alertify.confirm(title, mess, function () {
                    svShare.showLoading(true, "Change state");
                    svRooms.setLockRoom(!vm.roomJson.islock, vm.roomJson._id).then(function (success) {
                        alertify.success('Ok');
                        vm.roomJson.islock = !vm.roomJson.islock;
                        setTimeout(function () { $scope.$apply(); }, 1000);

                        svShare.showLoading(false);
                    }, function (err) {
                        svShare.showLoading(false);
                        alertify.error(err.data);
                    });

                }
                , function () { });

            } else {
                alertify.error("You dont have permisstion! Only owner can set lock/unlock room.");
            }
        }

        vm.cancle = function () {
            svShare.showLoading(false);
            $("#askPassword").modal('hide');
            setTimeout(function () { window.location.href = '/#'; }, 500);
        }

        vm.Share = function () {
            if (vm.my.isShowShareScreen == false) {// Event Share Screen
                vm.my.isShowError = false;
                var isChrome = !!window.chrome && !!window.chrome.webstore;
                if (isChrome) {
                    InitShareScreenStream(vm.currentUser.userName);
                } else {
                    vm.error = "Share Screen don't support this browser. Please switch Chrome to use it !";
                    vm.my.isShowError = true;
                }
            } else { // Event Stop Sharing Screen
                screen_stream.close();
                HiddenSharing()
            }
        }


        vm.append = function () {
            vm.my.isShowVideoConfernce = true;
            var div = document.createElement('div');
            div.setAttribute("class", "itemStreamVideo itemRemoveStreamVideo");
            $(".streamVideo").prepend(div);
            autoResizeItemContainer();
        }


        $('#passToJoin').keyup(function (event) {
            if (event.which == 13) {
                vm.verify();
            }
        });

        //add method 
        function LoadListUser() {
            svRooms.getListUser(roomID).then(function (ss) {
                console.log('ListUser: ', ss);
                vm.ListUser = ss.data;
                setTimeout(function () { $scope.$apply(); }, 1500);
            }, function (error) { });
        }

        function autoResizeItemContainer() {
            var i = $(".itemStreamVideo").length;
            console.log("i : ", i);
            console.log("Is Share Video :", vm.my.isShowShareScreen);
            if (vm.my.isShowShareScreen == true) {
                $(".itemStreamVideo").css("width", "13vw");
                $(".itemStreamVideo").css("height", "20vh");
            }
            else {
                if (i < 3) {
                    console.log("i<3: ", i);
                    $(".itemStreamVideo").css("width", "30vw");
                    $(".itemStreamVideo").css("height", "40vh");
                } else if (i < 5) {
                    console.log("i<5: ", i);
                    $(".itemStreamVideo").css("width", "20vw");
                    $(".itemStreamVideo").css("height", "30vh");
                } else if (i == 5) {
                    console.log("i==5: ", i);
                    $(".itemStreamVideo").css("width", "15vw");
                    $(".itemStreamVideo").css("height", "25vh");
                } else {
                    console.log("default: ", i);
                    $(".itemStreamVideo").css("width", "12vw");
                    $(".itemStreamVideo").css("height", "20vh");
                }
            }
        }

        function showUserOnline(username, streamID, isLocal) {
            $("#ulShowUser").append("<li id='li_" + streamID + "'><span class='glyphicon glyphicon-ok-circle' aria-hidden='true' style='color: green'></span> " + username + "</li>")
        }

        function InitShareScreenStream(username) {
            var screenName = "Screen: " + username;
            screen_stream = Erizo.Stream({ screen: true, attributes: { name: screenName } });
            screen_stream.init();
            screen_stream.addEventListener("access-accepted", function () {
                ShowSharing();
                room.publish(screen_stream);
                screen_stream.play("screen_stream");


                //for Click button "Stop Sharing" at the bottom of the screen
                screen_stream.stream.getVideoTracks()[0].onended = function () {
                    screen_stream.close();
                    HiddenSharing();
                };
            });

            screen_stream.addEventListener("access-denied", function (event) {
                console.log("Access-denied: ", event);
                var content = event.msg.code;
                if (event.msg.code === "Access to screen denied") {
                    content += "<br/>Please download <a href='./downloads/extensions.crx' download>extensions.crx</a> to install this plug-in for Google Chrome"

                }
                vm.error = "";
                $("#errorDiv").html(content);
                vm.my.isShowError = true;
                TimeoutHidenErrorDiv();
                $scope.$apply();
            });
        }

        function addImageUserForStream_NotCamera(idDivStream) {
            var idDiv = "#" + idDivStream;
            $(idDiv).css("background-image", "url(./images/user_icon.png)");
            $(idDiv).css("background-position", "center");
            $(idDiv).css("background-repeat", "no-repeat");
            $(idDiv).css("background-color", "white");
            $(idDiv).css("background-size", "contain");
        }

        function ShowSharing() {
            vm.my.isShowShareScreen = true;
            $("#btnShareScreen").html("Stop Sharing");
            autoResizeItemContainer();
            $scope.$apply();
        }

        function HiddenSharing() {
            $("#btnShareScreen").html("Share Screen");
            vm.my.isShowShareScreen = false;
            vm.my.isShowButtonShareScreen = true;
            autoResizeItemContainer();
            $scope.$apply();
        }

        function TimeoutHidenErrorDiv() {
            $timeout(function () {
                vm.my.isShowError = false;
                vm.error = "";
            }, 5000);
        }

        function DetectHasCamera_Audio_Speaker(callback) {
            var result = { IsEnumerateDevices: false, IsAudio: false, IsSpeaker: false, IsCamera: false, content: "" };
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                result.content = "Please switch Chorme or FireFox browser to use this function !";
                callback(result);
            }
            result.IsEnumerateDevices = true;

            navigator.mediaDevices.enumerateDevices().then(function (devices) {
                devices.forEach(function (itemDevice) {
                    if (itemDevice.kind === "audioinput") {
                        result.IsAudio = true;
                    }

                    if (itemDevice.kind === "videoinput") {
                        result.IsCamera = true;
                    }

                    if (itemDevice.kind === "audiooutput") {
                        result.IsSpeaker = true;
                    }
                });
                callback(result);
            }).catch(function (err) {
                result.IsEnumerateDevices = false;
                result.content = "Error: " + err.name + " - " + err.message;
                callback(result);
            });
        }

        

        function InitLocalStream(username, roomID, token, isSpeaker, isCamera) {

            var _isOwner = false;
            if (username == vm.roomJson.user) {
                _isOwner = true;
            }
            localStream = Erizo.Stream({ audio: isSpeaker, video: isCamera, data: true, attributes: { name: username, isOwner: _isOwner } });
            //localStream = Erizo.Stream({audio: isSpeaker, video: isCamera, url:"file:///tmp/true.mkv" });

            console.log("LocalStream Init:", localStream);
            room = Erizo.Room({ token: token });
            localStream.init();

            localStream.addEventListener("access-accepted", function () {
                if (role === "presenter") {
                    localStream.play("localStream");
                    svLocalStream.setLocalStream(localStream);
                }

                room.connect();




                var subscribeToStream = function (streams) {
                    console.log("subscribeToStream Array Stream: ", streams);
                    for (var index in streams) {
                        var stream = streams[index];
                        console.log("subscribeToStream Stream :", stream);
                        console.log("subscribeToStream StreamID :", stream.getID());
                        if (localStream.getID() !== stream.getID()) {
                            if (screen_stream) {
                                if (screen_stream.getID() !== stream.getID()) {
                                    room.subscribe(stream);
                                }
                            } else {
                                room.subscribe(stream);
                            } //end if

                        } else { // remote stream là local stream --> thì chuyển màu border div lại, để biết trạng thái kết nối socket thành công hay không ?
                            $("#localStream").css("border-color", "chartreuse");
                            if (!localStream.hasVideo()) {
                                addImageUserForStream_NotCamera("player_local");
                            }
                        }
                    }
                }

                var remoteDiv_RemoteStream = function (elementID, streamID, isScreen) {

                    if (isScreen == true) {
                        $("#screen_stream").html("");

                        HiddenSharing()
                    } else {
                        /*remove li in Show User online*/
                        $("#li_" + streamID).remove();

                        /*remove div remote stream */
                        $("#" + elementID).remove();
                    }
                }

                var askJoinLock = function(event) {
                  if(vm.roomJson.islock && !_isOwner) {
                          
                        room.socket.emit('knock',{ room: vm.roomJson._id, username: username}, function(msg){
                          console.log("Received socket:", msg);
                          if(msg.resType) {

                              if (isSpeaker === true || isCamera === true) {
                                  room.publish(localStream);
                              }
                              console.log("room connected");
                              console.log("Local Stream: ", localStream.getID())
                              showUserOnline(username, localStream.getID(), true);
                              subscribeToStream(event.streams);

                              //close alert
                              alertify.alert().close(); 
                          } else {                          

                            //close alert
                            alertify.alert().close(); 
                            
                            alertify.confirm('Denide form admin', '<i class="fa fa-ban"></i> Denide from admin. Ask join again?', function () {
                               askJoinLock(event);

                            }
                            , function () { });
                          }


                        });
                        alertify.alert('While accept', '<i class="fa fa-spinner fa-spin fa-fw"></i> Room locked. Please while accept from admin');
                        
                        return;
                      }

                      if (isSpeaker === true || isCamera === true) {
                          room.publish(localStream);
                      }
                      console.log("room connected");
                      console.log("Local Stream: ", localStream.getID())
                      showUserOnline(username, localStream.getID(), true);
                      subscribeToStream(event.streams);

                }

                room.addEventListener("room-connected", function (event) {
                    console.log(' >> event:', event);
                    console.log('room-connected');
                    
                    askJoinLock(event, _isOwner);
                });

                //ThanhDC3: received event from Room.js
                room.addEventListener("knock-room", function (event) {
                    console.log("------------Received Knock Knock:", event);
                    var item = { username: event.message.username, socket: event.message.socket };
                    vm.UsersKnock.push(item);
                    $scope.$apply();
                });

                //ThanhDC3: received event allow-join-room
                room.addEventListener("allow-join-room", function (event) {
                    console.log("-------------------Received Allow-Join-Room:", event);
                });

                room.addEventListener("stream-subscribed", function (streamEvent) {
                    console.log('stream-subscribed');
                    console.log("stream subscribed: ", streamEvent);
                    var stream = streamEvent.stream;
                    if (stream.hasScreen()) {
                        vm.my.isShowShareScreen = true;
                        vm.my.isShowButtonShareScreen = false;
                        autoResizeItemContainer();
                        $scope.$apply();
                        stream.play("screen_stream");

                    } else {
                        var idRmStream = "rmStream_" + stream.getID();
                        var div = document.createElement('div');
                        div.setAttribute("class", "itemStreamVideo");
                        div.setAttribute("id", idRmStream);
                        $(".streamVideo").prepend(div);
                        autoResizeItemContainer();
                        var attributes = stream.getAttributes();
                        if (attributes.name) {
                            showUserOnline(attributes.name, stream.getID(), false);
                        }

                        stream.play(idRmStream);
                        if (!stream.hasVideo()) {
                            addImageUserForStream_NotCamera("player_" + stream.getID());
                        }
                    }
                });

                room.addEventListener("stream-added", function (streamEvent) {
                    console.log('stream-added');
                    var streams = [];
                    streams.push(streamEvent.stream);
                    subscribeToStream(streams);
                });

                room.addEventListener("stream-removed", function (streamEvent) {
                    console.log('stream-removed');

                    LoadListUser();

                    var stream = streamEvent.stream;
                    if (stream.elementID !== undefined) {
                        remoteDiv_RemoteStream(stream.elementID, stream.getID(), stream.hasScreen());
                    }
                });

                room.addEventListener("room-error", function (event) {
                    console.log("Room-error: ", event);
                });

                room.addEventListener("room-disconnected", function (event) {
                    console.log("Room-disconnected: ", event);
                });
            })
        }

    }

})();