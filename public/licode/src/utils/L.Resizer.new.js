(function() {
    function b() {
        (new c.ElementQueries).init()
    }

    function a(a, b) {
        var c = Object.prototype.toString.call(a),
            f = 0,
            d = a.length;
        if ("[object Array]" === c || "[object NodeList]" === c || "[object HTMLCollection]" === c || "undefined" !== typeof jQuery && a instanceof jQuery || "undefined" !== typeof Elements && a instanceof Elements)
            for (; f < d; f++) b(a[f]);
        else b(a)
    }
    var c = this.L = this.L || {};
    c.ElementQueries = function() {
        function a(b) {
            b || (b = document.documentElement);
            b = getComputedStyle(b, "fontSize");
            return parseFloat(b) || 16
        }

        function b(d,
            c) {
            var f = c.replace(/[0-9]*/, ""),
                c = parseFloat(c);
            switch (f) {
                case "px":
                    return c;
                case "em":
                    return c * a(d);
                case "rem":
                    return c * a();
                case "vw":
                    return c * document.documentElement.clientWidth / 100;
                case "vh":
                    return c * document.documentElement.clientHeight / 100;
                case "vmin":
                case "vmax":
                    return c * (0, Math["vmin" === f ? "min" : "max"])(document.documentElement.clientWidth / 100, document.documentElement.clientHeight / 100);
                default:
                    return c
            }
        }

        function f(a) {
            this.element = a;
            this.options = [];
            var d, c, e, h = 0,
                g = 0,
                k, j, q, p, w;
            this.addOption =
                function(a) {
                    this.options.push(a)
                };
            var u = ["min-width", "min-height", "max-width", "max-height"];
            this.call = function() {
                h = this.element.offsetWidth;
                g = this.element.offsetHeight;
                q = {};
                d = 0;
                for (c = this.options.length; d < c; d++) e = this.options[d], k = b(this.element, e.value), j = "width" === e.property ? h : g, w = e.mode + "-" + e.property, p = "", "min" === e.mode && j >= k && (p += e.value), "max" === e.mode && j <= k && (p += e.value), q[w] || (q[w] = ""), p && -1 === (" " + q[w] + " ").indexOf(" " + p + " ") && (q[w] += " " + p);
                for (var a in u) q[u[a]] ? this.element.setAttribute(u[a],
                    q[u[a]].substr(1)) : this.element.removeAttribute(u[a])
            }
        }

        function j(a, b) {
            a.elementQueriesSetupInformation ? a.elementQueriesSetupInformation.addOption(b) : (a.elementQueriesSetupInformation = new f(a), a.elementQueriesSetupInformation.addOption(b), new c.ResizeSensor(a, function() {
                a.elementQueriesSetupInformation.call()
            }));
            a.elementQueriesSetupInformation.call()
        }

        function d(a) {
            for (var b, a = a.replace(/'/g, '"'); null !== (b = g.exec(a));)
                if (5 < b.length) {
                    var d = b[1] || b[5],
                        c = b[2],
                        e = b[3];
                    b = b[4];
                    var f = void 0;
                    document.querySelectorAll &&
                        (f = document.querySelectorAll.bind(document));
                    !f && "undefined" !== typeof $$ && (f = $$);
                    !f && "undefined" !== typeof jQuery && (f = jQuery);
                    if (!f) throw "No document.querySelectorAll, jQuery or Mootools's $$ found.";
                    for (var d = f(d), f = 0, h = d.length; f < h; f++) j(d[f], {
                        mode: c,
                        property: e,
                        value: b
                    })
                }
        }

        function k(a) {
            var b = "";
            if (a)
                if ("string" === typeof a) a = a.toLowerCase(), (-1 !== a.indexOf("min-width") || -1 !== a.indexOf("max-width")) && d(a);
                else
                    for (var c = 0, e = a.length; c < e; c++) 1 === a[c].type ? (b = a[c].selectorText || a[c].cssText, -1 !== b.indexOf("min-height") ||
                        -1 !== b.indexOf("max-height") ? d(b) : (-1 !== b.indexOf("min-width") || -1 !== b.indexOf("max-width")) && d(b)) : 4 === a[c].type && k(a[c].cssRules || a[c].rules)
        }
        var g = /,?([^,\n]*)\[[\s\t]*(min|max)-(width|height)[\s\t]*[~$\^]?=[\s\t]*"([^"]*)"[\s\t]*]([^\n\s\{]*)/mgi;
        this.init = function() {
            for (var a = 0, b = document.styleSheets.length; a < b; a++) k(document.styleSheets[a].cssText || document.styleSheets[a].cssRules || document.styleSheets[a].rules)
        }
    };
    window.addEventListener ? window.addEventListener("load", b, !1) : window.attachEvent("onload", b);
    var f = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(a) {
        return window.setTimeout(a, 20)
    };
    c.ResizeSensor = function(b, i) {
        function h() {
            var a = [];
            this.add = function(b) {
                a.push(b)
            };
            var b, c;
            this.call = function() {
                b = 0;
                for (c = a.length; b < c; b++) a[b].call()
            };
            this.remove = function(e) {
                var f = [];
                b = 0;
                for (c = a.length; b < c; b++) a[b] !== e && f.push(a[b]);
                a = f
            };
            this.length = function() {
                return a.length
            }
        }

        function j(a, b) {
            if (a.resizedAttached) {
                if (a.resizedAttached) {
                    a.resizedAttached.add(b);
                    return
                }
            } else a.resizedAttached = new h, a.resizedAttached.add(b);
            a.resizeSensor = document.createElement("div");
            a.resizeSensor.className = "resize-sensor";
            a.resizeSensor.style.cssText = "position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;";
            a.resizeSensor.innerHTML = '<div class="resize-sensor-expand" style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;"><div style="position: absolute; left: 0; top: 0; transition: 0s;"></div></div><div class="resize-sensor-shrink" style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;"><div style="position: absolute; left: 0; top: 0; transition: 0s; width: 200%; height: 200%"></div></div>';
            a.appendChild(a.resizeSensor);
            if ("static" === (a.currentStyle ? a.currentStyle.position : window.getComputedStyle ? window.getComputedStyle(a, null).getPropertyValue("position") : a.style.position)) a.style.position = "relative";
            var c = a.resizeSensor.childNodes[0],
                e = c.childNodes[0],
                i = a.resizeSensor.childNodes[1],
                j = function() {
                    e.style.width = "100000px";
                    e.style.height = "100000px";
                    c.scrollLeft = 1E5;
                    c.scrollTop = 1E5;
                    i.scrollLeft = 1E5;
                    i.scrollTop = 1E5
                };
            j();
            var t = !1,
                v = function() {
                    a.resizedAttached && (t && (a.resizedAttached.call(),
                        t = !1), f(v))
                };
            f(v);
            var x, D, r, q, p = function() {
                    if ((r = a.offsetWidth) !== x || (q = a.offsetHeight) !== D) t = !0, x = r, D = q;
                    j()
                },
                w = function(a, b, c) {
                    a.attachEvent ? a.attachEvent("on" + b, c) : a.addEventListener(b, c)
                };
            w(c, "scroll", p);
            w(i, "scroll", p)
        }
        a(b, function(a) {
            j(a, i)
        });
        this.detach = function(a) {
            c.ResizeSensor.detach(b, a)
        }
    };
    c.ResizeSensor.detach = function(b, c) {
        a(b, function(a) {
            if (a.resizedAttached && "function" === typeof c && (a.resizedAttached.remove(c), a.resizedAttached.length())) return;
            a.resizeSensor && (a.contains(a.resizeSensor) &&
                a.removeChild(a.resizeSensor), delete a.resizeSensor, delete a.resizedAttached)
        })
    }
})();