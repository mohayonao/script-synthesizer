/**
 * 017: Drawbar Organ
 * author: @mohayonao
 */
function synthdef(freq, notenumber, velocity) {
    var synth = T("*", T("+", T("sin", freq),
                              T("sin", freq * 2, 0.5),
                              T("sin", freq * 3, 0.25),
                              T("sin", freq * 5, 0.125)),
                       T("adsr", "24db", 5, 100, 0.9, 10));
    synth.keyon = function() {
        synth.args[1].bang();
    };
    synth.keyoff = function() {
        synth.args[1].keyoff();
    };
    return synth;
}
