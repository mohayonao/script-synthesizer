/**
 * 081: Lead 1 (square)
 * author: @mohayonao
 */
function synthdef(freq) {
    var synth = T("*", T("pulse", freq),
                       T("adsr", "24db", 5, 100, 0.7, 10));
    synth.keyon = function() {
        synth.args[1].bang();
    };
    synth.keyoff = function() {
        synth.args[1].keyoff();
    };
    return synth;
}
