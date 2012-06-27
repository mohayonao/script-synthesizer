/**
 * 033: Acoustic Bass
 * author: @mohayonao
 */
function synthdef(freq) {
    var op1 = T("*", T("oscx", T("phasor", freq * 0.25), 0.6).set({fb:0.15}),
                     T("adsr", "24db", 5, 150, 0.2, 250));
    var op2 = T("*", T("oscx", T("+", T("phasor", freq - 2), op1), 0.25),
                     T("adsr", "24db", 5, 45000, 0.2, 20));
    var op3 = T("*", T("oscx", T("phasor", freq * 0.25), 0.6),
                     T("adsr", "24db", 0, 150, 0.8, 250));
    var op4 = T("*", T("oscx", T("+", T("phasor", freq), op3)),
                     T("adsr", "24db", 0, 45000, 0.2, 20));
    var synth = T("+", op4, op2);
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
