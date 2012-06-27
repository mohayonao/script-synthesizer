var webmidilink = (function() {
    "use strict";
    
    var webmidilink = {};
    
    var Receiver = (function() {
        var Receiver = function() {
            initialize.apply(this, arguments);
        }, $this = Receiver.prototype;
        
        var Receivers = {};

        function hex2dec(s) {
            return parseInt(s, 0x10);
        }
        
        function init_listener() {
            window.addEventListener("message", function(e) {
                var msg, cmd, r, data;
                msg = e.data.split(",");
                if (msg[0] !== "midi") return;
                
                cmd = hex2dec(msg[1]);
                if ((r = Receivers[cmd & 0x0f]) !== undefined) {
                    r.receive(cmd & 0xf0, msg.slice(2).map(hex2dec));
                }
                
            }, false);
            init_listener.done = true;
        }
        
        var initialize = function(webi, ch) {
            this.webi = webi;
            if (1 <= ch && ch <= 16) {
                this.ch = ch;    
            } else {
                this.ch =  0;
            }
            Receivers[this.ch] = this;
            if (! init_listener.done) init_listener();
        };

        var funcTable = {
            0x80: "onNoteOff",
            0x90: "onNoteOn",
            0xb0: "onAllSoundOff"
        };
        
        $this.receive = function(cmd, args) {
            var f = this[funcTable[cmd]];
            if (f !== undefined) f.apply(null, args);
        };
        
        return Receiver;
    }());
    webmidilink.Receiver = Receiver;
    
    var Sender = (function() {
        var Sender = function() {
            initialize.apply(this, arguments);
        }, $this = Sender.prototype;
        
        var initialize = function(ch) {
            if (1 <= ch && ch <= 16) {
                this.ch = ch;    
            } else {
                this.ch =  0;
            }
            this.webi = null;
        };
        
        var send = function() {
            var args, msg;
            args = Array.prototype.slice.call(arguments);
            args[0] += this.ch;
            msg = "midi," + args.map(function(x) {
                return x.toString(0x10);
            }).join(",");
            if (this.webi) this.webi.postMessage(msg, "*");
        };
        
        $this.bindWebInstrument = function(webi) {
            this.webi = webi;
        };
        $this.noteOn = function(notenumber, velocity) {
            send.call(this, 0x90, notenumber, velocity);
        };
        $this.noteOff = function(notenumber, velocity) {
            send.call(this, 0x80, notenumber, velocity);
        };
        $this.allSoundOff = function() {
            send.call(this, 0xb0, 0x78, 0x00);
        };
        
        return Sender;
    }());
    webmidilink.Sender = Sender;
    
    return webmidilink;
}());
