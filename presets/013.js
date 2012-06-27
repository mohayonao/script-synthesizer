/**
 * 013: Marimba
 * author: @mohayonao
 */
function synthdef(freq) {
    var op4 = T("*", T("oscx", T("phasor", freq * 2), 0.2),
                     T("adsr", "24db", 100));
    var op3 = T("*", T("oscx", T("+", T("phasor", freq), op4), 0.4),
                     T("adsr", "24db", 100));
    var op2 = T("*", T("oscx", T("phasor", freq * 2), 0.25).set({fb:0.15}),
                     T("adsr", "24db", 250));
    var op1 = T("*", T("oscx", T("+", T("phasor", freq), op2)),
                     T("adsr", "24db", 5, 250));
    var synth = T("+", op1, op3);
    synth.keyon = function() {
        op1.args[1].bang();
        op2.args[1].bang();
        op3.args[1].bang();
        op4.args[1].bang();
    };
    synth.keyoff = function() {
        op1.args[1].keyoff();
        op2.args[1].keyoff();
        op3.args[1].keyoff();
        op4.args[1].keyoff();
    };
    return synth;
}
