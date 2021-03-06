// Generated by CoffeeScript 1.3.1
(function() {
  "use strict";

  jQuery(function() {
    var KeyMapping, MidiReceiver, PresetSelector, Q, Synth, SynthDefEditor, SynthDefList, Viewer, isDialog, showMessage;
    timbre.utils.exports("mtof");
    Q = (function() {
      var search;
      Q = {};
      search = location.search.substr(1);
      search.split("&").forEach(function(x) {
        x = x.split("=");
        if (x.length === 0) {
          return Q[x[0]] = true;
        } else {
          return Q[x[0]] = x[1];
        }
      });
      return Q;
    })();
    Synth = T("+").set({
      mul: 0.5
    }).play();
    Synth.noteOn = {};
    Synth.def = null;
    Synth["eval"] = function(code, verbose) {
      var def, msg, _ref, _ref1, _ref2, _ref3;
      Synth.source = code;
      code = code.substr(code.indexOf("function"));
      _ref = [null, ""], def = _ref[0], msg = _ref[1];
      try {
        def = eval("(function() { return " + code + "; }())");
      } catch (e) {
        _ref1 = [null, e.toString()], def = _ref1[0], msg = _ref1[1];
      }
      if (def !== null) {
        if (def instanceof Function) {
          if (!timbre.fn.isTimbreObject(def(0))) {
            _ref2 = [null, "SynthDef should return a TimbreObject."], def = _ref2[0], msg = _ref2[1];
          }
        } else {
          _ref3 = [null, "SynthDef should be an instance of Funtion."], def = _ref3[0], msg = _ref3[1];
        }
      }
      if (def !== null) {
        MidiReceiver.onAllSoundOff();
        Synth.def = def;
        if (verbose) {
          showMessage("success", "That's a nice!!");
        }
      } else if (verbose) {
        showMessage("error", msg);
      }
      return $("#evalSynthDef").attr({
        disabled: true
      });
    };
    Viewer = new WaveViewer(null, 60, "viewer", 512, 256);
    Viewer.listener = {
      wave: T("rec", 60, 50).set({
        overwrite: true
      }),
      fft: T("fft", 1024, 50)
    };
    Viewer.select = function(type) {
      var _ref;
      if ((_ref = Viewer.current) != null) {
        _ref.listen(null);
      }
      switch (type) {
        case "wave":
          Viewer.current = Viewer.listener.wave.listen(Synth).on().bang();
          Viewer.target = Viewer.current.buffer;
          return Viewer.range = [-1, 1];
        case "fft":
          Viewer.current = Viewer.listener.fft.listen(Synth).on().bang();
          Viewer.target = Viewer.current.spectrum;
          return Viewer.range = [0, 30000];
        case "*":
          return Viewer.current.listen(Synth).on().bang();
      }
    };
    Viewer.select("wave");
    SynthDefEditor = CodeMirror.fromTextArea($("#editor").get(0), {
      theme: "blackboard",
      lineNumbers: true,
      keyMap: "emacs",
      onChange: function() {
        return $("#evalSynthDef").attr({
          disabled: false
        });
      },
      onFocus: function(self) {
        self.onFocused = true;
        return showMessage("info", "Use C-x C-e to eval SynthDef.");
      },
      onBlur: function(self) {
        return self.onFocused = false;
      }
    });
    CodeMirror.keyMap["emacs-Ctrl-X"]["Ctrl-E"] = function(e) {
      return Synth["eval"](SynthDefEditor.getValue().trim(), true);
    };
    CodeMirror.keyMap["emacs-Ctrl-X"]["Ctrl-S"] = function(e) {
      return $("#dropdown-save").click();
    };
    CodeMirror.keyMap["emacs-Ctrl-X"]["Ctrl-F"] = function(e) {
      return $("#dropdown-load").click();
    };
    SynthDefEditor.prevKeyCode = 0;
    SynthDefEditor.onFocused = false;
    window.Editor = SynthDefEditor;
    PresetSelector = $("#preset");
    Presets.forEach(function(name, i) {
      name = ("000" + i).substr(-3) + (" :" + name);
      return PresetSelector.append($("<option>").text(name).attr("value", i));
    });
    PresetSelector.on("change", function() {
      var n;
      n = $(this).val();
      return jQuery.get("/presets/" + n, function(res) {
        SynthDefEditor.setValue(res);
        return Synth["eval"](res);
      });
    });
    PresetSelector.val(1);
    if (/^\d{1,3}$/.test(Q.p)) {
      PresetSelector.val(Q.p | 0);
    }
    PresetSelector.change();
    $("#viewer-wave").on("click", function() {
      return Viewer.select("wave");
    });
    $("#viewer-fft").on("click", function() {
      return Viewer.select("fft");
    });
    $("#tab a").click(function(e) {
      if (e.target.hash === "#tabViewer") {
        Viewer.start();
        Viewer.select("*");
      } else {
        Viewer.pause();
        Viewer.select("none");
      }
      if (e.target.hash === "#tabSynthDef") {
        return setTimeout((function() {
          return SynthDefEditor.refresh();
        }), 0);
      }
    });
    $("#evalSynthDef").on("click", function() {
      return Synth["eval"](SynthDefEditor.getValue().trim(), true);
    });
    showMessage = function(type, msg) {
      var $alert;
      $alert = $("#alert");
      ["info", "success", "error"].forEach(function(x) {
        return $alert.removeClass("alert-" + x);
      });
      $alert.addClass("alert-" + type).css("display", "block");
      $("strong", $alert).text({
        info: "INFO:",
        success: "WELL DONE!",
        error: "OH SNAP!"
      }[type] || "");
      return $(".msg", $alert).text(msg);
    };
    SynthDefList = localStorage.getItem("SynthDefList");
    if (typeof SynthDefList === "string") {
      SynthDefList = JSON.parse(SynthDefList);
    } else {
      SynthDefList = [];
    }
    SynthDefList.findIndexOf = function(name) {
      var i, _i, _ref;
      for (i = _i = 0, _ref = SynthDefList.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (SynthDefList[i][0] === name) {
          return i;
        }
      }
      return -1;
    };
    SynthDefList.update = function() {
      var list;
      SynthDefList.sort(function(a, b) {
        if (a[0] < b[0]) {
          return -1;
        } else {
          return +1;
        }
      });
      list = SynthDefList.map(function(x) {
        return x[0];
      });
      $("#loadDialog input").typeahead({
        source: list
      });
      return $("#saveDialog input").typeahead({
        source: list
      });
    };
    isDialog = false;
    $("#loadDialog").on("shown", function() {
      return isDialog = true;
    });
    $("#loadDialog").on("hidden", function() {
      return isDialog = false;
    });
    $("#loadDialog #exec").on("click", function() {
      var index, name, url;
      name = $("#loadDialog input").val().trim();
      if (/^[_a-zA-Z$][_a-zA-Z0-9$]*$/.test(name)) {
        index = SynthDefList.findIndexOf(name);
        if (index === -1) {
          return showMessage("error", "Cannot find a SynthDef '" + name + "'");
        } else {
          SynthDefEditor.setValue(SynthDefList[index][1]);
          showMessage("success", "Loaded the SynthDef '" + name + "'");
          return $("#loadDialog").modal("hide");
        }
      } else if (/^https?:\/\/.*$/.test(name)) {
        url = encodeURIComponent(name);
        return $.get("/api/synthdef/?url=" + url, function(res) {
          var data;
          data = JSON.parse(res);
          if (data.status === 200) {
            SynthDefEditor.setValue(data.body);
            showMessage("success", "Loaded the SynthDef '" + name + "'");
            return $("#loadDialog").modal("hide");
          }
        });
      } else {
        return showMessage("error", "Invalid name '" + name + "'");
      }
    });
    $("#saveDialog").on("shown", function() {
      return isDialog = true;
    });
    $("#saveDialog").on("hidden", function() {
      return isDialog = false;
    });
    $("#saveDialog #exec").on("click", function() {
      var code, index, name;
      name = $("#saveDialog input").val().trim();
      if (/^[_a-zA-Z$][_a-zA-Z0-9$]*$/.test(name)) {
        code = SynthDefEditor.getValue().trim();
        index = SynthDefList.findIndexOf(name);
        if (code === "") {
          if (index !== -1) {
            SynthDefList.splice(index, 1);
            SynthDefList.update();
            return showMessage("success", "Delete the SynthDef '" + name + "'");
          }
        } else {
          if (index === -1) {
            SynthDefList.push([name, code]);
            SynthDefList.update();
            showMessage("success", "Save a new SynthDef '" + name + "'");
          } else {
            SynthDefList[index] = [name, code];
            showMessage("success", "Update the SynthDef '" + name + "'");
          }
          localStorage.setItem("SynthDefList", JSON.stringify(SynthDefList));
          return $("#saveDialog").modal("hide");
        }
      } else {
        return showMessage("error", "Invalid name '" + name + "'");
      }
    });
    KeyMapping = {
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
      80: 76,
      keyDown: {}
    };
    window.addEventListener("keydown", function(e) {
      var notenumber;
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }
      if (SynthDefEditor.onFocused || isDialog) {
        return;
      }
      if (KeyMapping.keyDown[e.keyCode]) {
        return;
      }
      notenumber = KeyMapping[e.keyCode];
      if (notenumber) {
        MidiReceiver.onNoteOn(notenumber, 64);
      }
      return KeyMapping.keyDown[e.keyCode] = true;
    });
    window.addEventListener("keyup", function(e) {
      var notenumber;
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }
      if (SynthDefEditor.onFocused || isDialog) {
        return;
      }
      notenumber = KeyMapping[e.keyCode];
      if (notenumber) {
        MidiReceiver.onNoteOff(notenumber, 0);
      }
      return KeyMapping.keyDown[e.keyCode] = false;
    });
    MidiReceiver = new webmidilink.Receiver(0);
    MidiReceiver.onNoteOn = function(notenumber, velocity) {
      var freq, mul, s;
      s = Synth.noteOn[notenumber];
      if (s === void 0) {
        freq = timbre.utils.mtof(notenumber);
        s = typeof Synth.def === "function" ? Synth.def(freq, notenumber, velocity) : void 0;
        if (!timbre.fn.isTimbreObject(s)) {
          return;
        }
        Synth.noteOn[notenumber] = s.appendTo(Synth);
        s.notenumber = notenumber;
        s.onended = function() {
          return delete Synth.noteOn[s.removeFrom(Synth).notenumber];
        };
        if (Synth.args.length > 4) {
          delete Synth.noteOn[Synth.args.shift().notenumber];
        }
      }
      mul = 1 - timbre.utils.db2num(velocity / 6);
      return s.set({
        mul: mul
      }).keyon();
    };
    MidiReceiver.onNoteOff = function(notenumber, velocity) {
      var _ref;
      return (_ref = Synth.noteOn[notenumber]) != null ? _ref.keyoff() : void 0;
    };
    return MidiReceiver.onAllSoundOff = function() {
      var _results;
      _results = [];
      while (Synth.args.length > 0) {
        _results.push(delete Synth.noteOn[Synth.args.shift().notenumber]);
      }
      return _results;
    };
  });

}).call(this);
