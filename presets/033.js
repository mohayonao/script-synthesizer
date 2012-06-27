/**
 * 033: Acoustic Bass
 * author: @mohayonao
 */
var synth = T("+");

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
    
    synth.onbang = function() {
        op1.args[1].bang();
        op2.args[1].bang();
        op3.args[1].bang();
        op4.args[1].bang();
    };
    
    return synth;
}

synth.noteon = function(midinote, velocity) {
    var s = synth.noteon[midinote];
    
    if (velocity > 0) {
        if (! s) {
            var freq = timbre.utils.mtof(midinote);
            s = synth.noteon[midinote] = synthdef(freq).appendTo(synth);
            s.midinote = midinote;
            s.args[0].args[1].onended = function() {
                delete synth.noteon[s.removeFrom(synth).midinote];
            };
            if (synth.args.length > 1) {
                delete synth.noteon[synth.args.shift().midinote];
            }
        }
        s.set({mul:velocity / 128}).bang();
    } else {
        if (s) s.args[1].keyOff();
    }
}

return synth;
