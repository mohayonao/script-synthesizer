(function() {
  "use strict";
  jQuery(function() {
    var eval_synth, interval, prev_code, selector;
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
    selector.change();
    $("#code").on("keydown", function(e) {
      if (e.ctrlKey && e.keyCode === 32) return e.preventDefault();
    });
    $("#code").on("keyup", function(e) {
      if (e.ctrlKey && e.keyCode === 32) return eval_synth($(this).val().trim());
    });
    interval = T("interval", 600, function() {
      var doremi, i, _ref;
      doremi = [72, 74, 76, 77, 79, 81, 83, 84];
      i = interval.count % doremi.length;
      if ((_ref = window.synth) != null ? _ref.noteon : void 0) {
        return window.synth.noteon(doremi[i], 64);
      }
    });
    return window.testplay = function(b) {
      if (b) {
        return interval.on();
      } else {
        return interval.off();
      }
    };
  });

}).call(this);
