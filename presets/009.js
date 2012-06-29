/**
 * 009: Celesta
 * author: @mohayonao
 */
function synthdef(freq, notenumber, velocity) {
    var op1 = T("oscx", T("phasor", 200), 0.01).set({fb:0.1});
    var op2 = T("*", T("oscx", T("+", T("phasor", freq), op1), 0.4),
                     T("adsr", "32db", 0, 450, 0.4, 500));
    var op3 = T("oscx", T("phasor", freq * 14), 0.1);
    var op4 = T("*", T("oscx", T("+", T("phasor", freq * 2), op3), 1.0),
                     T("adsr", "24db", 0, 250, 0.1, 500));
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
