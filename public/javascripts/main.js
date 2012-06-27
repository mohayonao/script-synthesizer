(function() {
  "use strict";
  jQuery(function() {
    var eval_synth, hex2dec, id, interval, prev_code, selector, webMidiLinkRecv;
    window.synth = null;
    prev_code = "";
    eval_synth = function(code) {
      var _synth;
      if (prev_code !== code) {
        _synth = null;
        try {
          _synth = eval("(function() {" + code + "}());");
        } finally {
          if (!timbre.fn.isTimbreObject(_synth)) _synth = null;
        }
        if (_synth) {
          timbre.dacs.removeAll();
          window.synth = _synth.play();
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
    if (/^\d{1,3}$/.test(id)) selector.val(id | 0);
    selector.change();
    $("#code").on("keydown", function(e) {
      if (e.ctrlKey && e.keyCode === 32) return e.preventDefault();
    });
    $("#code").on("keyup", function(e) {
      if (e.ctrlKey && e.keyCode === 32) return eval_synth($(this).val().trim());
    });
    $("#volume").slider({
      value: 80,
      slide: function() {
        return timbre.amp = $(this).slider("value") / 100;
      }
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
    hex2dec = function(s) {
      return parseInt(s, 16);
    };
    webMidiLinkRecv = function(e) {
      var msg, _ref, _ref2;
      msg = e.data.split(",");
      if (msg[0] !== "midi") return;
      switch (hex2dec(msg[1]) & 0xf0) {
        case 0x80:
          return (_ref = window.synth) != null ? _ref.noteon(hex2dec(msg[2])) : void 0;
        case 0x90:
          return (_ref2 = window.synth) != null ? _ref2.noteon(hex2dec(msg[2]), hex2dec(msg[3])) : void 0;
      }
    };
    return window.addEventListener("message", webMidiLinkRecv, false);
  });

}).call(this);
