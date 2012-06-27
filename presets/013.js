/**
 * 013: Marimba
 * author: @mohayonao
 */
function synthdef(freq) {
    var op1 = T("oscx", T("phasor", freq * 2), 0.2);
    var op2 = T("*", T("oscx", T("+", T("phasor", freq), op1), 0.05),
                      T("adsr", "32db", 0, 200, 0.2, 100));
    var op3 = T("oscx", T("phasor", freq * 8), 0.05);
    var op4 = T("*", T("oscx", T("+", T("phasor", freq), op3), 0.1),
                     T("adsr", "24db", 0, 300, 0.3, 200));
    var synth = T("+", op2, op4);
    synth.keyon = function() {
        op2.args[1].bang();
        op4.args[1].bang();
    };
    synth.keyoff = function() {
        op2.args[1].keyoff();
        op4.args[1].keyoff();
    };
    return synth;
}
