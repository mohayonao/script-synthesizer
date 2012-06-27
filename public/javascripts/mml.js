// Generated by CoffeeScript 1.3.1
(function() {

  jQuery(function() {
    var MMLCommand, MMLTrack, mml, send, webi;
    timbre.setup({
      streamsize: 512
    });
    webi = null;
    send = function(msg) {
      return webi != null ? webi.postMessage(msg, "*") : void 0;
    };
    MMLCommand = (function() {

      MMLCommand.name = 'MMLCommand';

      function MMLCommand(name, sign, length, dot) {
        this.name = name;
        this.type = "><lov".indexOf(name) !== -1;
        this.sign = sign;
        this.length = (length || 0) | 0;
        this.dot = (dot || "").length;
      }

      return MMLCommand;

    })();
    MMLTrack = (function() {

      MMLTrack.name = 'MMLTrack';

      function MMLTrack(mml) {
        var bpm, commands, dot, fetch, index, len, m, msg, octave, re, samples, velocity;
        re = /([><tlovcdefgabr])([-+]?)(\d*)(\.*)/ig;
        commands = [];
        while (true) {
          m = re.exec(mml);
          if (!m) {
            break;
          } else if (m[1] === "t") {
            bpm = (m[3] || 120) | 0;
          } else {
            commands.push(new MMLCommand(m[1], m[2], m[3], m[4]));
          }
        }
        bpm = 120;
        index = 0;
        octave = 5;
        len = 4;
        dot = 0;
        velocity = 8;
        samples = 0;
        msg = "";
        fetch = function() {
          var cmd, _ref;
          cmd = commands[index++];
          index %= commands.length;
          if (cmd.type) {
            switch (cmd.name) {
              case "<":
                octave += 1;
                break;
              case ">":
                octave -= 1;
                break;
              case "l":
                _ref = [cmd.length, cmd.dot], len = _ref[0], dot = _ref[1];
                break;
              case "o":
                octave = cmd.length;
                break;
              case "v":
                velocity = cmd.length;
            }
            cmd = fetch();
          }
          return cmd;
        };
        this.seq = function() {
          var cmd, _dot, _len, _midino, _velocity;
          if (samples <= 0) {
            if (msg) {
              msg = send(msg);
            }
            cmd = fetch();
            if (cmd.name !== "r") {
              _midino = timbre.utils.atom(cmd.name.toUpperCase() + (octave - 1));
              switch (cmd.sign) {
                case "+":
                  _midino++;
                  break;
                case "-":
                  _midino--;
              }
              _velocity = (velocity / 15 * 128) | 0;
              _midino = _midino.toString(0x10);
              _velocity = _velocity.toString(0x10);
              send("midi,90," + _midino + "," + _velocity);
              msg = "midi,80," + _midino + ",0";
            }
            _dot = cmd.dot;
            if (_dot === 0 && cmd.length === 0) {
              _dot = dot;
            }
            _len = cmd.length;
            if (!_len) {
              _len = len;
            }
            _len = timbre.samplerate * (60 / bpm) * (4 / _len);
            while (_dot--) {
              _len *= 1.5;
            }
            samples += _len | 0;
          }
          return samples -= timbre.cellsize;
        };
      }

      return MMLTrack;

    })();
    mml = T("interval", 0, function() {
      return mml.track.seq();
    });
    $("#open").on("click", function() {
      var url;
      if (webi) {
        webi.close();
      }
      url = $("#webi").val() || "/";
      return webi = window.open(url, null, "width=900,height=670,scrollbars=yes,resizable=yes");
    });
    return $("#play").on("click", function() {
      if (mml.isOn) {
        mml.off();
        return $(this).text("play");
      } else if (webi !== null) {
        mml.track = new MMLTrack($("#code").val().trim().toLowerCase());
        mml.on();
        return $(this).text("stop");
      }
    });
  });

}).call(this);
