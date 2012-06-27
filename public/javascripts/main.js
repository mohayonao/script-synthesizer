(function() {
  "use strict";
  jQuery(function() {
    var eval_synth, prev_code, selector;
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
      return jQuery.get("/presets/" + n + ".js", function(res) {
        $("#code").val(res);
        return eval_synth(res);
      });
    });
    $("#code").on("keydown", function(e) {
      if (e.ctrlKey && e.keyCode === 32) return e.preventDefault();
    });
    return $("#code").on("keyup", function(e) {
      if (e.ctrlKey && e.keyCode === 32) return eval_synth($(this).val().trim());
    });
  });

}).call(this);
