/*global window, document, L, webkitURL*/
'use strict';
/*
 * VideoPlayer represents a Licode video component that shows either a local or a remote video.
 * Ex.: var player = VideoPlayer({id: id, stream: stream, elementID: elementID});
 * A VideoPlayer is also a View component.
 */
var Erizo = Erizo || {};
Erizo.VideoPlayer = function (spec) {
    var that = Erizo.View({}),
        onmouseover,
        onmouseout;

    // Variables

    // VideoPlayer ID
    that.id = spec.id;

    // Stream that the VideoPlayer will play
    that.stream = spec.stream.stream;

    // DOM element in which the VideoPlayer will be appended
    that.elementID = spec.elementID;

    // Private functions
    onmouseover = function () {
        that.bar.display();
    };

    onmouseout = function () {
        that.bar.hide();
    };

    // Public functions

    // It will stop the VideoPlayer and remove it from the HTML
    that.destroy = function () {
        that.video.pause();
        delete that.resizer;
        that.parentNode.removeChild(that.div);
    };

    that.resize = function () {

        var width = that.container.offsetWidth,
            height = that.container.offsetHeight;

        if (spec.stream.screen || spec.options.crop === false) {

            if (width * (9 / 16) < height) {

                that.video.style.width = width + 'px';
                that.video.style.height = (9 / 16) * width + 'px';

                that.video.style.top = -((9 / 16) * width / 2 - height / 2) + 'px';
                that.video.style.left = '0px';

            } else {

                that.video.style.height = height + 'px';
                that.video.style.width = (16 / 9) * height + 'px';

                that.video.style.left = -((16 / 9) * height / 2 - width / 2) + 'px';
                that.video.style.top = '0px';

            }
        } else {
            if (width !== that.containerWidth || height !== that.containerHeight) {

                if (width * (3 / 4) > height) {

                    that.video.style.width = width + 'px';
                    that.video.style.height = (3 / 4) * width + 'px';

                    that.video.style.top = -((3 / 4) * width / 2 - height / 2) + 'px';
                    that.video.style.left = '0px';

                } else {

                    that.video.style.height = height + 'px';
                    that.video.style.width = (4 / 3) * height + 'px';

                    that.video.style.left = -((4 / 3) * height / 2 - width / 2) + 'px';
                    that.video.style.top = '0px';

                }
            }
        }

        that.containerWidth = width;
        that.containerHeight = height;

    };

    /*window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        document.getElementById(key).value = unescape(value);
    });*/

    L.Logger.debug('Creating URL from stream ' + that.stream);
    var myURL = window.URL || webkitURL;
    that.streamUrl = myURL.createObjectURL(that.stream);

    // Container
    that.div = document.createElement('div');
    that.div.setAttribute('id', 'player_' + that.id);
    that.div.setAttribute('class', 'player');
    that.div.setAttribute('style', 'width: 100%; height: 100%; position: relative; ' +
                                   'background-color: black; overflow: hidden;');

    // Loader icon
    if (spec.options.loader !== false) {
      that.loader = document.createElement('img');
      that.loader.setAttribute('style', 'width: 16px; height: 16px; position: absolute; ' +
                                        'top: 50%; left: 50%; margin-top: -8px; margin-left: -8px');
      that.loader.setAttribute('id', 'back_' + that.id);
      that.loader.setAttribute('class', 'loader');
      that.loader.setAttribute('src', that.url + '/images/loader.gif');
    }

    // Video tag
    that.video = document.createElement('video');
    that.video.setAttribute('id', 'stream' + that.id);
    that.video.setAttribute('class', 'stream');
    that.video.setAttribute('style', 'width: 100%; height: 100%; position: absolute');
    that.video.setAttribute('autoplay', 'autoplay');

    if(spec.stream.local)
        that.video.volume = 0;

    if (that.elementID !== undefined) {
        // Check for a passed DOM node.
        if (typeof that.elementID === 'object' &&
          typeof that.elementID.appendChild === 'function') {
            that.container = that.elementID;
        }
        else {
            that.container = document.getElementById(that.elementID);
        }
    } else {
        that.container = document.body;
    }
    that.container.appendChild(that.div);

    that.parentNode = that.div.parentNode;

    if (that.loader) {
      that.div.appendChild(that.loader);
    }
    that.div.appendChild(that.video);

    that.containerWidth = 0;
    that.containerHeight = 0;

    if (spec.options.resizer !== false) {
      that.resizer = new L.ResizeSensor(that.container, that.resize);

      that.resize();
    }

    // Bottom Bar
    if (spec.options.bar !== false) {
        that.bar = new Erizo.Bar({elementID: 'player_' + that.id,
                                  id: that.id,
                                  stream: spec.stream,
                                  media: that.video,
                                  options: spec.options});

        that.div.onmouseover = onmouseover;
        that.div.onmouseout = onmouseout;
    }
    else {
        // Expose a consistent object to manipulate the media.
        that.media = that.video;
    }

    that.video.src = that.streamUrl;

    return that;
};
