/**
 * 001: Acoustic Piano
 * author: @mohayonao
 */
function synthdef(freq) {
    var synth = T("*", T("+", T("sin", freq),
                              T("sin", freq * 2, 0.5),
                              T("sin", freq * 4, 0.25),
                              T("sin", freq * 5, 0.125)),
                       T("adsr", "24db", 5, 10000, 0.0, 2500));
    synth.keyon = function() {
        synth.args[1].bang();
    };
    synth.keyoff = function() {
        synth.args[1].keyoff();
    };
    return synth;
}
