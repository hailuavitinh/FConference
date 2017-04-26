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

        var chatboxShow = false, wbShow = false;
        
        //$(".user-list").mCustomScrollbar( { setHeight: 250 });
        $(".chat-content").mCustomScrollbar( { setHeight: 285 });
        $(".chat-content").mCustomScrollbar("scrollTo","bottom");

        vm.my = { isShowVideoConfernce: false, isShowError: false, isShowEnterUserName: true, isShowShareScreen: false, isShowButtonShareScreen: false };
        vm.ListUser = [];
        var roomID = $routeParams.roomID;
        var room;

        console.log("Angular Join: ", roomID);

        var username = 'u' + Math.floor(Math.random() * 1000000000);
        var role = "presenter";
        vm.currentUser = [];
        var isOwner = false;

        var streamID = '';

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

            // for (var i = 0; i <= 5; i++) {
            //   svShare.addNofify('notify in top ' + i);
            // }

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
              svShare.addNofify("This room protect by password", "warning");
              $("#askPassword").modal('show');

            } else {
                
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
                    svShare.addNofify("Share Screen don't support", "error");
                    vm.my.isShowError = true;
                }
            } else { // Event Stop Sharing Screen
                screen_stream.close();
                HiddenSharing()
            }
        }

        vm.askJoinModal = function() {
          console.log('askJoin');
          $('#askJoin').modal('show');
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

        vm.askJoinKnock = function() {
          if(vm.roomJson.islock && vm.roomJson.user != username) {
            if(room !== undefined) {
              room.socket.emit('knock',{ room: vm.roomJson._id, username: username}, function(msg){
                  console.log(msg);
                  if(msg.resType) {
                              
                      alertify.alert().close(); 

                      //alertify.alert('While accept', '<i class="fa fa-spinner fa-spin fa-fw"></i> Room locked. Please while accept from admin');
                      alertify.confirm('While accept', '<i class="fa fa-spinner fa-spin fa-fw"></i> Room locked. Please while accept from admin OR ask join again?', function () {
                          vm.askJoinKnock();
                        }
                        , function () { alertify.warning("You dont connect to rom. Ask join on Knock button on left menu"); });
                  } else {

                    //close alert
                    alertify.alert().close(); 
                    
                    alertify.confirm('While accept', '<i class="fa fa-ban"></i> Please while admin to join room. Ask join again?', function () {
                       vm.askJoinKnock();

                    }
                    , function () { alertify.warning("You dont connect to rom. Ask join on Knock button on left menu"); });
                  }

              });
              
            }
          }
        }

        vm.openWhiteBoard = function() {
            $('#wb_notify').hide();
            if(!wbShow) {
                wbShow = true;
                $('.wb-box').fadeIn();
                $('.wb-btn').addClass('wb-btn-active');
            } else {
                wbShow = false;
                $('.wb-btn').removeClass('wb-btn-active');
                $('.wb-box').fadeOut();
            }
        }

        vm.openChat = function() {
            $('#chat_notify').hide();
            $('#txtText').focus();
            if(!chatboxShow) {
                chatboxShow = true;
                $('.chat-box').fadeIn();
                $(".chat-content").mCustomScrollbar("scrollTo","bottom");
            }
            else {
                chatboxShow = false;
                $('.chat-box').fadeOut();
            }
        }

        vm.sendChat = function() {
            if(room != undefined) {

                var mes = $('#txtText').val();
                if(svShare.isNullOrEmpty(mes)) {
                    return;
                }

                console.log( "sendMessageChat", vm.roomJson._id, username );
                var datasend = {
                    room: vm.roomJson._id, 
                    message: mes, 
                    username: username
                };
                room.socket.emit("sendMessageChat", datasend, function(res) {
                    console.log('send message success!', res);
                    $('#txtText').val('');
                    $('#txtText').focus();
                    //onDataStream
                });
            }
        }
        $('#txtText').keyup(function(e) {
            if (e.keyCode === 13) {
               vm.sendChat();
            }
        });

        //add method 
        function LoadListUser() {
            svRooms.getListUser(roomID).then(function (ss) {
                console.log('ListUser: ', ss);
                vm.ListUser = ss.data;
                if(vm.ListUser.length > 0)
                    $('.count_user').html("(" + vm.ListUser.length + ")");
                else 
                    $('.count_user').html("");

                setTimeout(function () {
                    $scope.$apply();
                    var h = $('.left-menu-bottom').height() - 55;
                    if(h < 150)
                        h = 150;
                    $('.user-list').mCustomScrollbar("destroy");
                    $(".user-list").mCustomScrollbar( { setHeight: h });
                 }, 
                 1500);
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

                //vm.isShowShareScreen = true;
                //vm.isShowVideoConfernce= false;
                //vm.my.isShowButtonShareScreen = false;
                $scope.$apply();                
                svShare.addNofify("Share screen enable", "info");
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
                svShare.addNofify("Access to screen denied", "warning");
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

        function AppendChat(msg) {
            var str = '';
            if(msg.username == username) {
                str += '<div class="chat-me"><small>' + msg.time + '</small><br><div class="chat-mess">' + msg.message + '</div></div>';
            }
            else { 
                $('#chat_notify').show();
                str += '<div class="chat-panner"><span>' + msg.username + ' </span> <small>'+ msg.time +'</small>: <br><div class="chat-mess">' + msg.message + '</div></div>';
            }
           
            $('.chat-content .mCSB_container').append(str);
            $(".chat-content").mCustomScrollbar("update");
            $(".chat-content").mCustomScrollbar("scrollTo","bottom");

        }

        function InitLocalStream(username, roomID, token, isSpeaker, isCamera) {

            var _isOwner = false;
            var _streamlist;
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
                        streamID = stream.getID();
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
                              
                              alertify.alert().close(); 

                              //alertify.alert('While accept', '<i class="fa fa-spinner fa-spin fa-fw"></i> Room locked. Please while accept from admin');
                              alertify.confirm('While accept', '<i class="fa fa-spinner fa-spin fa-fw"></i> Room locked. Please while accept from admin OR ask join again?', function () {
                                  askJoinLock(event);
                                }
                                , function () { alertify.warning("You dont connect to rom. Ask join on Knock button on left menu"); });
                          } else {

                            //close alert
                            alertify.alert().close(); 
                            
                            alertify.confirm('While accept', '<i class="fa fa-ban"></i> Please while admin to join room. Ask join again?', function () {
                               askJoinLock(event);

                            }
                            , function () { alertify.warning("You dont connect to rom. Ask join on Knock button on left menu"); });
                          }


                        });
                        svShare.addNofify("This room is locked", "warning");
                        alertify.alert('While accept', '<i class="fa fa-spinner fa-spin fa-fw"></i> Room locked. Please while accept from admin');
                        
                        return;
                      }

                      alertify.success("Connect room successful");
                      svShare.addNofify("Connect room successful", "success");
                      if (isSpeaker === true || isCamera === true) {
                          room.publish(localStream);
                      }
                      console.log("room connected");
                      console.log("Local Stream: ", localStream.getID());
                      showUserOnline(username, localStream.getID(), true);
                      subscribeToStream(event.streams);

                }

                room.addEventListener("room-connected", function (event) {
                    console.log(' >> event:', event);
                    console.log('room-connected');
                    _streamlist = event.streams;
                    console.log(' ---------- _streamlist: ',_streamlist);
                    askJoinLock(event, _isOwner);
                });

                room.addEventListener("stream-data", function (event) {
                    console.log(' >> event: onDataStream', event);
                });

                //receive-message-chat datnhh
                room.addEventListener("receive-message-chat", function (event) {
                    console.log(' >> event: receive-message-chat', event);
                    AppendChat(event.message);
                });

                //ThanhDC3: received event from Room.js
                room.addEventListener("knock-room", function (event) {
                    console.log("------------Received Knock Knock:", event);
                    var item = { username: event.message.username, socket: event.message.socket };

                    //check if user in ask array
                    var added = false;
                    $.map(vm.UsersKnock, function(elementOfArray, indexInArray) {
                      if (elementOfArray.username == event.message.username) {
                        added = true;
                      }
                    });
                    if (!added) {
                      vm.UsersKnock.push(item);
                      $scope.$apply();
                    }

                    alertify.warning('Someone knock room!');
                    //svShare.addNofify("Someone knock room", "warning");
                    svShare.addNofify('User <b>' + event.message.username + '</b> ask you to join room!');
                    vm.askJoinModal();
                });

                //ThanhDC3: received event allow-join-room
                room.addEventListener("allow-join-room", function (event) {
                    console.log("-------------------Received Allow-Join-Room:", event.message.isAllow);
                    alertify.alert().close(); 
                    alertify.confirm().close(); 
                    if(event.message.isAllow) {
                      
                      alertify.success("Allow from admin");
                      svShare.addNofify("Allow from admin");
                      if (isSpeaker === true || isCamera === true) {
                        room.publish(localStream);
                      }
                      showUserOnline(username, localStream.getID(), true);

                      console.log(' event.streams',event.message);

                      subscribeToStream(_streamlist);
                      alertify.success("Connect room successful");
                      svShare.addNofify("Connect room successful", "success");
                    
                    } else {
                      svShare.addNofify("Denied from Admin", "error");
                      alertify.confirm('Denied from Admin', '<i class="fa fa-ban"></i> Denied from admin. Ask join again?', function () {
                         askJoinLock(event);
                      }
                      , function () { });
                    }

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
                    svShare.addNofify("New stream added", "info");
                    streams.push(streamEvent.stream);
                    subscribeToStream(streams);
                });

                room.addEventListener("stream-removed", function (streamEvent) {
                    console.log('stream-removed', streamEvent);

                    LoadListUser();
                    svShare.addNofify("Some stream removed", "warning");
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

        /*
        * Konva Section
        *
        */

        angular.element(document).ready(function () {
           var isPaint = false,
                lastPointerPosition,
                chooseColor = 'red',
                //width = $('#containerCanvas').width(),
                //height = $('#containerCanvas').height();
                width = $(window).width() - 46 - 70,
                height = $(window).height() - 51 - 55;

            console.log(width, height);

            var stage = new Konva.Stage({
                container:'containerCanvas',
                width:width,
                height:height,
                //draggable: true
            });
            var numberStageWidth = stage.width();
            var numberStageHeigh = stage.height();
            var offsetContainerCanvas = $('#containerCanvas').offset();
            var layer = new Konva.Layer();
            stage.add(layer);

            var canvas = document.createElement("canvas");
            canvas.width = stage.width() + 15;
            canvas.height = stage.height();

            var image = new Konva.Image({
                image:canvas,
                x:0,
                y:0,
                stroke: 'gray'
            });
            layer.add(image);
            stage.draw();

            var socket = io.connect("192.168.1.17:3001",{secure:true,transport:["websocket"]});

            socket.on("messageKonva",function(data){
                console.log("Socket message: ",data);
                ReceivedSocketDraw(data);
            });

            socket.on("connection_failed",function(data){
                console.log("Socket failed: ",data);
            });

            socket.on("error",function(data){
                console.log("Socket Error: ",data);
            });

            socket.on("drawingKonva",function(data){
                $('#wb_notify').show();
                console.log("Drawing: ",data);

                var oldPos = MultiplicationPercentCor(data.oldPointerPosition);

                var newPos = MultiplicationPercentCor(data.newPointerPosition);

                Drawing(oldPos,newPos,data.color);   
            });

            socket.on("clearBoard", function(data) {
                $('#wb_notify').hide();
                console.log("clearBoard", data);
                content.clearRect(0,0,content.canvas.width,content.canvas.height);
                layer.draw();
                lastPointerPosition={};
            });

            socket.on("addText", function(data) {        
                $('#wb_notify').show();
                var simpleText = new Konva.Text({
                  x: data.x,
                  y: data.y,
                  text: data.text,
                  fontSize: data.fontSize,
                  fontFamily: data.fontFamily,
                  fill: data.fill,
                  id: data.id,
                  draggable: true
                });
                _i++;
                layer.add(simpleText);
                layer.draw();
                simpleText.on("mouseover", function() {
                    document.body.style.cursor = "pointer";
                    //console.log('mouseover');
                });
                simpleText.on("mouseout", function() {
                    document.body.style.cursor = "default";
                    //console.log('mouseout');
                });

            });

            socket.on("moveText", function(data) {
                $('#wb_notify').show();
                console.log("moveText", data);
                var shape = stage.find('#' + data.id)[0];
                if(shape !== undefined) {
                   shape.position(data.pos);
                   shape.moveToTop();
                   layer.draw();
                }
            });

            socket.on("deleteText", function(data) {
                $('#wb_notify').show();
                var shape = stage.find(data.id)[0];
                if(shape !== undefined) {
                    _i--;
                    console.log('shape remove');
                    shape.remove();//.destroy();
                    layer.draw();
                }
            });


            var content = canvas.getContext('2d');
            content.lineJoin = 'round';
            content.lineWidth = 5;

            //Event mouseDown 
            stage.on('contentMousedown.proto touchstart',function(evt){
                //console.log('mousedown touchstart', evt);
                $('.wb-color').hide();
                $('.wb-text').hide();
                $('.wb-control').hide();

                if (document.body.style.cursor == "pointer") {
                    var circle = evt.target;
                    layer.draw();            
                } else {
                    isPaint = true;
                    lastPointerPosition = stage.getPointerPosition();
                }
            });

            //Event mouseUp
            stage.on('contentMouseup.proto touchend',function(evt){
                isPaint = false;
                if (document.body.style.cursor == "pointer") {
                    var _text = evt.evt.dragEndNode;
                    var n = _text.id();
                    console.log(n);
                    socket.emit("moveText", {id: n, pos: stage.getPointerPosition()});
                    //console.log(stage.getPointerPosition());
                }

            });

            //Event Mousemove
            stage.on('contentMousemove.proto touchmove',function(){
                if(!isPaint){
                    return;
                }
                var oldPos = lastPointerPosition;
                var newPos = stage.getPointerPosition();
                
                Drawing(oldPos,newPos,chooseColor);

                lastPointerPosition = newPos;
                var PercentOldPos = DivisionPercentCor(oldPos);
                var PercentNewPos = DivisionPercentCor(newPos);
                //option: Realtime when mouse move
                socket.emit("drawKonva",{
                    oldPointerPosition:PercentOldPos,
                    newPointerPosition:PercentNewPos,
                    color:chooseColor
                });
            });


            
            //Button chose Color
            $(".btnColor").click(function(e){
                chooseColor = $(this).attr('data-value');
            });

            //Button Clear
            $("#btnClear").click(function(e){
                content.clearRect(0,0,content.canvas.width,content.canvas.height);
                layer.draw();
                lastPointerPosition={};
                socket.emit("clearBoard",{
                    isClear:true
                });
            });

            $('#btnAddImage').click(function(e){
                // console.log("Layer",layer);
                // var image2 = new Konva.Image({

                // });
            });

            $('#btnDownload').click(function(e){
                Canvas2Image.saveAsImage(canvas, content.canvas.width, content.canvas.height, 'png');
            });
            var _i = 1;
            $('#btnAddText').click(function(e) {
                var text = $('#txtAddText').val();
                //var randX = Math.random() * stage.getWidth();
                //var randY = Math.random() * stage.getHeight();
                var data = {
                  x: 100 + (_i *10),
                  y: 30 + (_i *10),
                  text: text,
                  fontSize: 30,
                  fontFamily: 'Calibri',
                  fill: 'green',
                  id: 'text_' + _i,
                  draggable: true
                };
                var simpleText = new Konva.Text(data);
                _i++;
                layer.add(simpleText);
                layer.draw();
                simpleText.on("mouseover", function() {   
                    document.body.style.cursor = "pointer";
                    //console.log('mouseover');
                });
                simpleText.on("mouseout", function() {
                    document.body.style.cursor = "default";
                    //console.log('mouseout');
                });

                socket.emit("addText",data);
            });
            
            $('#btnCText').click(function(e) {
                var id = '#text_' + (_i-1);
                var shape = stage.find(id)[0];
                if(shape !== undefined) {
                    _i--;
                    console.log('shape remove');
                    shape.remove();//.destroy();
                    layer.draw();
                }
                socket.emit("deleteText", {id: id });
            });

            


            //Function drawing
            function Drawing(oldPointerPosition,newPointerPosition,color){
                if(color == "#fff") {
                     content.lineWidth = 20;
                } else {
                     content.lineWidth = 5;
                }

                content.beginPath();
                var localPos = {
                    x: oldPointerPosition.x - image.x(),
                    y:oldPointerPosition.y - image.y()
                };

                content.moveTo(localPos.x,localPos.y);
                
                localPos = {
                    x: newPointerPosition.x - image.x(),
                    y:newPointerPosition.y - image.y()
                };
                content.lineTo(localPos.x,localPos.y);
                content.strokeStyle = color;
                content.closePath();
                content.stroke();
                layer.draw();
            };

            //function received Socket and draw
            function ReceivedSocketDraw(data){
                //var socketPosition = data.konvaPosition;
                for(var i = 0; i < data.konvaPosition.length;i++){

                    var oldPos = MultiplicationPercentCor(data.konvaPosition[i].oldPointerPosition);

                    var newPos = MultiplicationPercentCor(data.konvaPosition[i].newPointerPosition);

                    Drawing(oldPos, newPos, data.konvaPosition[i].color);   
                    
                }
            } //end function

            function DivisionPercentCor(coor){
                return {
                    //làm tròn theo đơn vị của stage.width và heigh
                    x: Math.round(coor.x / stage.width() * numberStageWidth)/numberStageWidth,
                    y: Math.round(coor.y / stage.height() * numberStageHeigh)/numberStageHeigh 
                };
            }// end function DividePercentCor

            function MultiplicationPercentCor(coor){
                return {
                    //làm tròn theo đơn vị của stage.width và heigh
                    x: Math.round(coor.x * stage.width() * numberStageWidth)/numberStageWidth,
                    y: Math.round(coor.y * stage.height() * numberStageHeigh)/numberStageHeigh 
                };
            }// end function DividePercentCor    

        });

        vm.showWbControl = function(tool) {
            
            switch (tool) {
                case 1: 
                    $('.wb-color').show();
                    $('.wb-text').hide();
                    $('.wb-control').hide();
                    break;
                case 2: 
                    $('.wb-color').hide();
                    $('.wb-text').hide();
                    $('.wb-control').show();
                    break;
                case 3:                    
                    $('.wb-color').hide();
                    $('.wb-text').show();
                    $('.wb-control').hide();
                    break;
            }
        }

    }

})();