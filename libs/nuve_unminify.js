/*
 */
/*
 MIT
*/
var Url = require("url"),
    spawn = require("child_process").spawn,
    fs = require("fs"),
    XMLHttpRequest = function() {
        var b = this,
            p = require("http"),
            q = require("https"),
            h = {},
            l, c, d = {},
            o = {
                "User-Agent": "node.js",
                Accept: "*/*"
            },
            i = !1,
            m = !1,
            n = o;
        this.UNSENT = 0;
        this.OPENED = 1;
        this.HEADERS_RECEIVED = 2;
        this.LOADING = 3;
        this.DONE = 4;
        this.readyState = this.UNSENT;
        this.onreadystatechange = null;
        this.responseXML = this.responseText = "";
        this.statusText = this.status = null;
        var j = function(a) {
            b.readyState = a;
            if ("function" === typeof b.onreadystatechange) b.onreadystatechange();
            if ("readystatechange" in h)
                for (var a = h.readystatechange.length, f = 0; f < a; f++) h.readystatechange[f].call(b)
        };
        this.open = function(a, b, e, c, g) {
            d = {
                method: a,
                url: b.toString(),
                async: "boolean" !== typeof e ? !0 : e,
                user: c || null,
                password: g || null
            };
            this.abort();
            j(this.OPENED)
        };
        this.setRequestHeader = function(a, b) {
            if (this.readyState !== this.OPENED) throw "NVALID_STATE_ERR: setRequestHeader can only be called when state is OPEN";
            if (i) throw "INVALID_STATE_ERR: send flag is true";
            n[a] = b
        };
        this.getResponseHeader = function(a) {
            return this.readyState >
                this.OPENED && c.headers[a] && !m ? c.headers[a] : null
        };
        this.getAllResponseHeaders = function() {
            if (this.readyState < this.HEADERS_RECEIVED || m) return "";
            var a = "",
                b;
            for (b in c.headers) a += b + ": " + c.headers[b] + "\r\n";
            return a.substr(0, a.length - 2)
        };
        this.send = function(a) {
            if (this.readyState !== this.OPENED) throw "INVALID_STATE_ERR: connection must be opened before send() is called";
            if (i) throw "INVALID_STATE_ERR: send has already been called";
            var f = !1,
                e = Url.parse(d.url),
                k;
            switch (e.protocol) {
                case "https:":
                    f = !0;
                case "http:":
                    k =
                        e.hostname;
                    break;
                case void 0:
                case "":
                    k = "localhost";
                    break;
                default:
                    throw "Protocol not supported.";
            }
            var g = e.port || (f ? 443 : 80),
                e = e.pathname + (e.search ? e.search : "");
            this.setRequestHeader("Host", k);
            if (d.user) {
                "undefined" === typeof d.password && (d.password = "");
                var h = new Buffer(d.user + ":" + d.password);
                n.Authorization = "Basic " + h.toString("base64")
            }
            "GET" === d.method || "HEAD" === d.method ? a = null : a && (this.setRequestHeader("Content-Length", Buffer.byteLength(a)), n["Content-Type"] || this.setRequestHeader("Content-Type", "text/plain;charset=UTF-8"));
            k = {
                host: k,
                port: g,
                path: e,
                method: d.method,
                headers: n
            };
            m = !1;
            if (!d.hasOwnProperty("async") || d.async) {
                f = f ? q.request : p.request;
                i = !0;
                if ("function" === typeof b.onreadystatechange) b.onreadystatechange();
                l = f(k, function(a) {
                    c = a;
                    c.setEncoding("utf8");
                    j(b.HEADERS_RECEIVED);
                    b.status = c.statusCode;
                    c.on("data", function(a) {
                        if (a) b.responseText = b.responseText + a;
                        i && j(b.LOADING)
                    });
                    c.on("end", function() {
                        if (i) {
                            j(b.DONE);
                            i = false
                        }
                    });
                    c.on("error", function(a) {
                        b.handleError(a)
                    })
                }).on("error", function(a) {
                    b.handleError(a)
                });
                a && l.write(a);
                l.end()
            } else {
                g = ".node-xmlhttprequest-sync-" + process.pid;
                fs.writeFileSync(g, "", "utf8");
                a = "var http = require('http'), https = require('https'), fs = require('fs');var doRequest = http" + (f ? "s" : "") + ".request;var options = " + JSON.stringify(k) + ";var responseText = '';var req = doRequest(options, function(response) {response.setEncoding('utf8');response.on('data', function(chunk) {responseText += chunk;});response.on('end', function() {fs.writeFileSync('" + g + "', 'NODE-XMLHTTPREQUEST-STATUS:' + response.statusCode + ',' + responseText, 'utf8');});response.on('error', function(error) {fs.writeFileSync('" +
                    g + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');});}).on('error', function(error) {fs.writeFileSync('" + g + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');});" + (a ? "req.write('" + a.replace(/'/g, "\\'") + "');" : "") + "req.end();";
                for (syncProc = spawn(process.argv[0], ["-e", a]);
                    "" == (b.responseText = fs.readFileSync(g, "utf8")););
                syncProc.stdin.end();
                fs.unlinkSync(g);
                b.responseText.match(/^NODE-XMLHTTPREQUEST-ERROR:/) ? (a = b.responseText.replace(/^NODE-XMLHTTPREQUEST-ERROR:/, ""),
                    b.handleError(a)) : (b.status = b.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:([0-9]*),.*/, "$1"), b.responseText = b.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:[0-9]*,(.*)/, "$1"), j(b.DONE))
            }
        };
        this.handleError = function(a) {
            this.status = 503;
            this.statusText = a;
            this.responseText = a.stack;
            m = !0;
            j(this.DONE)
        };
        this.abort = function() {
            l && (l.abort(), l = null);
            n = o;
            this.responseXML = this.responseText = "";
            m = !0;
            if (this.readyState !== this.UNSENT && (this.readyState !== this.OPENED || i) && this.readyState !== this.DONE) i = !1, j(this.DONE);
            this.readyState = this.UNSENT
        };
        this.addEventListener = function(a, b) {
            a in h || (h[a] = []);
            h[a].push(b)
        }
    };
var CryptoJS = CryptoJS || function(e, f) {
    var j = {},
        g = j.lib = {},
        b = g.Base = function() {
            function h() {}
            return {
                extend: function(a) {
                    h.prototype = this;
                    var b = new h;
                    a && b.mixIn(a);
                    b.$super = this;
                    return b
                },
                create: function() {
                    var h = this.extend();
                    h.init.apply(h, arguments);
                    return h
                },
                init: function() {},
                mixIn: function(h) {
                    for (var a in h) h.hasOwnProperty(a) && (this[a] = h[a]);
                    h.hasOwnProperty("toString") && (this.toString = h.toString)
                },
                clone: function() {
                    return this.$super.extend(this)
                }
            }
        }(),
        l = g.WordArray = b.extend({
            init: function(h, a) {
                h =
                    this.words = h || [];
                this.sigBytes = a != f ? a : 4 * h.length
            },
            toString: function(h) {
                return (h || d).stringify(this)
            },
            concat: function(h) {
                var a = this.words,
                    b = h.words,
                    d = this.sigBytes,
                    h = h.sigBytes;
                this.clamp();
                if (d % 4)
                    for (var c = 0; c < h; c++) a[d + c >>> 2] |= (b[c >>> 2] >>> 24 - 8 * (c % 4) & 255) << 24 - 8 * ((d + c) % 4);
                else if (65535 < b.length)
                    for (c = 0; c < h; c += 4) a[d + c >>> 2] = b[c >>> 2];
                else a.push.apply(a, b);
                this.sigBytes += h;
                return this
            },
            clamp: function() {
                var a = this.words,
                    c = this.sigBytes;
                a[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4);
                a.length = e.ceil(c / 4)
            },
            clone: function() {
                var a =
                    b.clone.call(this);
                a.words = this.words.slice(0);
                return a
            },
            random: function(a) {
                for (var c = [], b = 0; b < a; b += 4) c.push(4294967296 * e.random() | 0);
                return l.create(c, a)
            }
        }),
        c = j.enc = {},
        d = c.Hex = {
            stringify: function(a) {
                for (var c = a.words, a = a.sigBytes, b = [], d = 0; d < a; d++) {
                    var l = c[d >>> 2] >>> 24 - 8 * (d % 4) & 255;
                    b.push((l >>> 4).toString(16));
                    b.push((l & 15).toString(16))
                }
                return b.join("")
            },
            parse: function(a) {
                for (var c = a.length, b = [], d = 0; d < c; d += 2) b[d >>> 3] |= parseInt(a.substr(d, 2), 16) << 24 - 4 * (d % 8);
                return l.create(b, c / 2)
            }
        },
        k = c.Latin1 = {
            stringify: function(a) {
                for (var c =
                        a.words, a = a.sigBytes, b = [], d = 0; d < a; d++) b.push(String.fromCharCode(c[d >>> 2] >>> 24 - 8 * (d % 4) & 255));
                return b.join("")
            },
            parse: function(a) {
                for (var c = a.length, b = [], d = 0; d < c; d++) b[d >>> 2] |= (a.charCodeAt(d) & 255) << 24 - 8 * (d % 4);
                return l.create(b, c)
            }
        },
        a = c.Utf8 = {
            stringify: function(a) {
                try {
                    return decodeURIComponent(escape(k.stringify(a)))
                } catch (c) {
                    throw Error("Malformed UTF-8 data");
                }
            },
            parse: function(a) {
                return k.parse(unescape(encodeURIComponent(a)))
            }
        },
        i = g.BufferedBlockAlgorithm = b.extend({
            reset: function() {
                this._data = l.create();
                this._nDataBytes = 0
            },
            _append: function(c) {
                "string" == typeof c && (c = a.parse(c));
                this._data.concat(c);
                this._nDataBytes += c.sigBytes
            },
            _process: function(a) {
                var c = this._data,
                    d = c.words,
                    b = c.sigBytes,
                    i = this.blockSize,
                    k = b / (4 * i),
                    k = a ? e.ceil(k) : e.max((k | 0) - this._minBufferSize, 0),
                    a = k * i,
                    b = e.min(4 * a, b);
                if (a) {
                    for (var g = 0; g < a; g += i) this._doProcessBlock(d, g);
                    g = d.splice(0, a);
                    c.sigBytes -= b
                }
                return l.create(g, b)
            },
            clone: function() {
                var a = b.clone.call(this);
                a._data = this._data.clone();
                return a
            },
            _minBufferSize: 0
        });
    g.Hasher = i.extend({
        init: function() {
            this.reset()
        },
        reset: function() {
            i.reset.call(this);
            this._doReset()
        },
        update: function(a) {
            this._append(a);
            this._process();
            return this
        },
        finalize: function(a) {
            a && this._append(a);
            this._doFinalize();
            return this._hash
        },
        clone: function() {
            var a = i.clone.call(this);
            a._hash = this._hash.clone();
            return a
        },
        blockSize: 16,
        _createHelper: function(a) {
            return function(c, b) {
                return a.create(b).finalize(c)
            }
        },
        _createHmacHelper: function(a) {
            return function(c, b) {
                return o.HMAC.create(a, b).finalize(c)
            }
        }
    });
    var o = j.algo = {};
    return j
}(Math);
(function() {
    var e = CryptoJS,
        f = e.lib,
        j = f.WordArray,
        f = f.Hasher,
        g = [],
        b = e.algo.SHA1 = f.extend({
            _doReset: function() {
                this._hash = j.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
            },
            _doProcessBlock: function(b, c) {
                for (var d = this._hash.words, k = d[0], a = d[1], i = d[2], e = d[3], h = d[4], f = 0; 80 > f; f++) {
                    if (16 > f) g[f] = b[c + f] | 0;
                    else {
                        var j = g[f - 3] ^ g[f - 8] ^ g[f - 14] ^ g[f - 16];
                        g[f] = j << 1 | j >>> 31
                    }
                    j = (k << 5 | k >>> 27) + h + g[f];
                    j = 20 > f ? j + ((a & i | ~a & e) + 1518500249) : 40 > f ? j + ((a ^ i ^ e) + 1859775393) : 60 > f ? j + ((a & i | a & e | i & e) - 1894007588) : j + ((a ^ i ^ e) -
                        899497514);
                    h = e;
                    e = i;
                    i = a << 30 | a >>> 2;
                    a = k;
                    k = j
                }
                d[0] = d[0] + k | 0;
                d[1] = d[1] + a | 0;
                d[2] = d[2] + i | 0;
                d[3] = d[3] + e | 0;
                d[4] = d[4] + h | 0
            },
            _doFinalize: function() {
                var b = this._data,
                    c = b.words,
                    d = 8 * this._nDataBytes,
                    f = 8 * b.sigBytes;
                c[f >>> 5] |= 128 << 24 - f % 32;
                c[(f + 64 >>> 9 << 4) + 15] = d;
                b.sigBytes = 4 * c.length;
                this._process()
            }
        });
    e.SHA1 = f._createHelper(b);
    e.HmacSHA1 = f._createHmacHelper(b)
})();
(function() {
    var e = CryptoJS,
        f = e.enc.Utf8;
    e.algo.HMAC = e.lib.Base.extend({
        init: function(e, g) {
            e = this._hasher = e.create();
            "string" == typeof g && (g = f.parse(g));
            var b = e.blockSize,
                l = 4 * b;
            g.sigBytes > l && (g = e.finalize(g));
            for (var c = this._oKey = g.clone(), d = this._iKey = g.clone(), k = c.words, a = d.words, i = 0; i < b; i++) k[i] ^= 1549556828, a[i] ^= 909522486;
            c.sigBytes = d.sigBytes = l;
            this.reset()
        },
        reset: function() {
            var f = this._hasher;
            f.reset();
            f.update(this._iKey)
        },
        update: function(f) {
            this._hasher.update(f);
            return this
        },
        finalize: function(f) {
            var e =
                this._hasher,
                f = e.finalize(f);
            e.reset();
            return e.finalize(this._oKey.clone().concat(f))
        }
    })
})();
var N = N || {};
N.authors = ["aalonsog@dit.upm.es", "prodriguez@dit.upm.es", "jcervino@dit.upm.es"];
N.version = 0.1;
N = N || {};
N.Base64 = function() {
    var e, f, j, g, b, l, c, d, k;
    e = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9,+,/".split(",");
    f = [];
    for (b = 0; b < e.length; b += 1) f[e[b]] = b;
    l = function(a) {
        j = a;
        g = 0
    };
    c = function() {
        var a;
        if (!j || g >= j.length) return -1;
        a = j.charCodeAt(g) & 255;
        g += 1;
        return a
    };
    d = function() {
        if (!j) return -1;
        for (;;) {
            if (g >= j.length) return -1;
            var a = j.charAt(g);
            g += 1;
            if (f[a]) return f[a];
            if ("A" === a) return 0
        }
    };
    k = function(a) {
        a = a.toString(16);
        1 === a.length && (a =
            "0" + a);
        return unescape("%" + a)
    };
    return {
        encodeBase64: function(a) {
            var b, d, f;
            l(a);
            a = "";
            b = Array(3);
            d = 0;
            for (f = !1; !f && -1 !== (b[0] = c());)
                if (b[1] = c(), b[2] = c(), a += e[b[0] >> 2], -1 !== b[1] ? (a += e[b[0] << 4 & 48 | b[1] >> 4], -1 !== b[2] ? (a += e[b[1] << 2 & 60 | b[2] >> 6], a += e[b[2] & 63]) : (a += e[b[1] << 2 & 60], a += "=", f = !0)) : (a += e[b[0] << 4 & 48], a += "=", a += "=", f = !0), d += 4, 76 <= d) a += "\n", d = 0;
            return a
        },
        decodeBase64: function(a) {
            var b, c;
            l(a);
            a = "";
            b = Array(4);
            for (c = !1; !c && -1 !== (b[0] = d()) && -1 !== (b[1] = d());) b[2] = d(), b[3] = d(), a += k(b[0] << 2 & 255 | b[1] >> 4), -1 !==
                b[2] ? (a += k(b[1] << 4 & 255 | b[2] >> 2), -1 !== b[3] ? a += k(b[2] << 6 & 255 | b[3]) : c = !0) : c = !0;
            return a
        }
    }
}(N);
N = N || {};
N.API = function(e) {
    var f, j, g;
    f = function(b, f, c, d, k, a, i, o) {
        var h, p, r, q, n, m;
        void 0 === a ? (h = e.API.params.service, p = e.API.params.key, k = e.API.params.url + k) : (h = a.service, p = a.key, k = a.url + k);
        "" === h || "" === p ? console.log("ServiceID and Key are required!!") : (a = (new Date).getTime(), r = Math.floor(99999 * Math.random()), q = a + "," + r, n = "MAuth realm=http://marte3.dit.upm.es,mauth_signature_method=HMAC_SHA1", i && o && (i = g(i), n = n + ",mauth_username=" + i + ",mauth_role=" + o, q += "," + i + "," + o), i = j(q, p), n = n + ",mauth_serviceid=" + h + ",mauth_cnonce=" + r +
            ",mauth_timestamp=" + a + ",mauth_signature=" + i, m = new XMLHttpRequest, m.onreadystatechange = function() {
                if (m.readyState === 4) switch (m.status) {
                    case 100:
                    case 200:
                    case 201:
                    case 202:
                    case 203:
                    case 204:
                    case 205:
                        b(m.responseText);
                        break;
                    default:
                        f !== void 0 && f(m.status + " Error" + m.responseText, m.status)
                }
            }, m.open(c, k, !0), m.setRequestHeader("Authorization", n), void 0 !== d) ? (m.setRequestHeader("Content-Type", "application/json"), m.send(JSON.stringify(d))) : m.send()
    };
    j = function(b, f) {
        var c;
        c = CryptoJS.HmacSHA1(b, f).toString(CryptoJS.enc.Hex);
        return e.Base64.encodeBase64(c)
    };
    g = function(b) {
        var b = b.toLowerCase(),
            f = {
                a: "[\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5]",
                ae: "\u00e6",
                c: "\u00e7",
                e: "[\u00e8\u00e9\u00ea\u00eb]",
                i: "[\u00ec\u00ed\u00ee\u00ef]",
                n: "\u00f1",
                o: "[\u00f2\u00f3\u00f4\u00f5\u00f6]",
                oe: "\u0153",
                u: "[\u00f9\u00fa\u00fb\u0171\u00fc]",
                y: "[\u00fd\u00ff]"
            },
            c;
        for (c in f) b = b.replace(RegExp(f[c], "g"), c);
        return b
    };
    return {
        params: {
            service: void 0,
            key: void 0,
            url: void 0
        },
        init: function(b, f, c) {
            e.API.params.service = b;
            e.API.params.key = f;
            e.API.params.url =
                c
        },
        createRoom: function(b, e, c, d, g) {
            d || (d = {});
            f(function(a) {
                a = JSON.parse(a);
                e(a)
            }, c, "POST", {
                name: b,
                options: d
            }, "rooms", g)
        },
        getRooms: function(b, e, c) {
            f(b, e, "GET", void 0, "rooms", c)
        },
        getRoom: function(b, e, c, d) {
            f(e, c, "GET", void 0, "rooms/" + b, d)
        },
        updateRoom: function(b, e, c, d, g, a) {
            f(c, d, "PUT", {
                name: e,
                options: g
            }, "rooms/" + b, a)
        },
        setLockRoom: function(b, e, c, d, a) {
            f(c, d, "PUT", {
                islock: e
            }, "rooms/setlock/" + b, a)
        },
        patchRoom: function(b, e, c, d, g, a) {
            f(c, d, "PATCH", {
                name: e,
                options: g
            }, "rooms/" + b, a)
        },
        deleteRoom: function(b, e, c, d) {
            f(e, c, "DELETE", void 0, "rooms/" + b, d)
        },
        createToken: function(b, e, c, x, d, g, a) {
            console.log( " ----------- isowner", x);
            var body = { "isowner": x };

            f(d, g, "POST", body, "rooms/" + b + "/tokens", a, e, c)
        },
        createService: function(b, e, c, d, g) {
            f(c, d, "POST", {
                name: b,
                key: e
            }, "services/", g)
        },
        getServices: function(b, e, c) {
            f(b, e, "GET", void 0, "services/", c)
        },
        getService: function(b, e, c, d) {
            f(e, c, "GET", void 0, "services/" + b, d)
        },
        deleteService: function(b, e, c, d) {
            f(e, c, "DELETE", void 0, "services/" + b, d)
        },
        getUsers: function(b, e, c, d) {
            f(e, c, "GET", void 0, "rooms/" + b + "/users/", d)
        },
        getUser: function(b, e, c, d, g) {
            f(c, d, "GET", void 0, "rooms/" + b + "/users/" + e, g)
        },
        deleteUser: function(b, e, c, d, g) {
            f(c,
                d, "DELETE", void 0, "rooms/" + b + "/users/" + e, g)
        }
    }
}(N);
module.exports = N;