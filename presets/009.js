/**
 * 009: Celesta
 * author: @mohayonao
 */
function synthdef(freq) {
    var op2 = T("oscx", T("phasor", freq * 14, 0.25));
    var op1 = T("*", T("oscx", T("+", T("phasor", freq), op2), 0.5),
                     T("adsr", "24db", 0, 2500, 0.2, 1000));
    var synth = op1;
    synth.keyon = function() {
        op1.args[1].bang();
    };
    synth.keyoff = function() {
        op1.args[1].keyoff();
    };
    return synth;
}
