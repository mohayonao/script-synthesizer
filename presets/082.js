/**
 * 082: Lead 2 (sawtooth)
 * author: @mohayonao
 */
function synthdef(freq, notenumber, velocity) {
    var synth = T("*", T("saw", freq),
                       T("adsr", "24db", 5, 100, 0.7, 10));
    synth.keyon = function() {
        synth.args[1].bang();
    };
    synth.keyoff = function() {
        synth.args[1].keyoff();
    };
    return synth;
}
