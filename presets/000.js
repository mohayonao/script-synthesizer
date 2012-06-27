function (freq) {
    var synth = T("*", T("sin", freq, 0.8),
                       T("adsr", "24db", 10, 100, 0.7, 10));
    synth.keyon = function() {
        synth.args[1].bang();
    };
    synth.keyoff = function() {
        synth.args[1].keyoff();
    };
    return synth;
}
