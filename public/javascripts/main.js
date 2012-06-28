// Generated by CoffeeScript 1.3.1
(function() {
  "use strict";

  jQuery(function() {
    var eval_synth, id, interval, isEditing, isKeyDown, key2notenumber, prev_code, receiver, selector, synth;
    window.synthdef = null;
    prev_code = "";
    eval_synth = function(code) {
      var _synthdef;
      code = code.substr(code.indexOf("function"));
      if (prev_code !== code) {
        _synthdef = null;
        try {
          _synthdef = eval("(function () { return " + code + "; }());");
        } catch (e) {
          _synthdef = null;
        } finally {
          if (!(_synthdef instanceof Function)) {
            _synthdef = null;
          }
        }
        if (_synthdef) {
          receiver.onAllSoundOff();
          window.synthdef = _synthdef;
          return $("#code").css("color", "black");
        } else {
          return $("#code").css("color", "red");
        }
      }
    };
    selector = $("#synth-selector");
    Preset.forEach(function(name, i) {
      name = ("000" + i).substr(-3) + (" :" + name);
      return selector.append($("<option>").text(name).attr("value", i));
    });
    selector.on("change", function() {
      var n;
      n = $(this).val();
      return jQuery.get("/presets/" + n, function(res) {
        $("#code").val(res);
        return eval_synth(res);
      });
    });
    id = location.search.substr(1);
    if (/^\d{1,3}$/.test(id)) {
      selector.val(id | 0);
    }
    selector.val(1).change();
    isEditing = false;
    $("#code").on("focus", function(e) {
      return isEditing = true;
    });
    $("#code").on("blur", function(e) {
      return isEditing = false;
    });
    $("#code").on("keydown", function(e) {
      if (e.ctrlKey && e.keyCode === 32) {
        return e.preventDefault();
      }
    });
    $("#code").on("keyup", function(e) {
      if (e.ctrlKey && e.keyCode === 32) {
        return eval_synth($(this).val().trim());
      }
    });
    $("#volume").slider({
      value: 80,
      slide: function() {
        return timbre.amp = $(this).slider("value") / 100;
      }
    });
    $("#mute").on("click", function() {
      if (timbre.amp) {
        timbre.amp = 0;
        return $(this).css("color", "blue");
      } else {
        timbre.amp = 0.8;
        return $(this).css("color", "black");
      }
    });
    $("#reload").on("click", function() {
      return selector.change();
    });
    interval = T("interval", 600, function() {
      var doremi, i, _ref;
      doremi = [72, 74, 76, 77, 79, 81, 83, 84];
      i = interval.count % doremi.length;
      if ((_ref = window.synth) != null ? _ref.noteon : void 0) {
        return window.synth.noteon(doremi[i], 64);
      }
    });
    window.testplay = function(b) {
      if (b) {
        return interval.on();
      } else {
        return interval.off();
      }
    };
    synth = T("+").play();
    synth.noteOn = {};
    receiver = new webmidilink.Receiver(0);
    receiver.onNoteOn = function(notenumber, velocity) {
      var freq, s;
      s = synth.noteOn[notenumber];
      if (!s) {
        freq = timbre.utils.mtof(notenumber);
        s = typeof window.synthdef === "function" ? window.synthdef(freq) : void 0;
        if (!timbre.fn.isTimbreObject(s)) {
          return;
        }
        synth.noteOn[notenumber] = s.appendTo(synth);
        s.notenumber = notenumber;
        s.onended = function() {
          return delete synth.noteOn[s.removeFrom(synth).notenumber];
        };
        if (synth.args.length > (synth.poly || 4)) {
          delete synth.noteOn[synth.args.shift().notenumber];
        }
      }
      return s.set({
        mul: velocity / 128
      }).keyon();
    };
    receiver.onNoteOff = function(notenumber, velocity) {
      var _ref;
      return (_ref = synth.noteOn[notenumber]) != null ? _ref.keyoff() : void 0;
    };
    receiver.onAllSoundOff = function() {
      var _results;
      _results = [];
      while (synth.args.length > 0) {
        _results.push(delete synth.noteOn[synth.args.shift().notenumber]);
      }
      return _results;
    };
    key2notenumber = {
      90: 48,
      83: 49,
      88: 50,
      68: 51,
      67: 52,
      86: 53,
      71: 54,
      66: 55,
      72: 56,
      78: 57,
      74: 58,
      77: 59,
      188: 60,
      76: 61,
      190: 62,
      186: 63,
      81: 60,
      50: 61,
      87: 62,
      51: 63,
      69: 64,
      82: 65,
      53: 66,
      84: 67,
      54: 68,
      89: 69,
      55: 70,
      85: 71,
      73: 72,
      57: 73,
      79: 74,
      48: 75,
      80: 76
    };
    isKeyDown = {};
    window.addEventListener("keydown", function(e) {
      var notenumber;
      if (isEditing) {
        return;
      }
      if (isKeyDown[e.keyCode]) {
        return;
      }
      notenumber = key2notenumber[e.keyCode];
      if (notenumber) {
        receiver.onNoteOn(notenumber, 64);
      }
      return isKeyDown[e.keyCode] = true;
    });
    return window.addEventListener("keyup", function(e) {
      var notenumber;
      if (isEditing) {
        return;
      }
      notenumber = key2notenumber[e.keyCode];
      if (notenumber) {
        receiver.onNoteOff(notenumber, 0);
      }
      return isKeyDown[e.keyCode] = false;
    });
  });

}).call(this);
