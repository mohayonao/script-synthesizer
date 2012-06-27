/**
 * 013: Marimba
 * author: @mohayonao
 */
var synth = T("+");

function synthdef(freq) {
    var op1 = T("*", T("oscx", T("phasor", freq * 14), 0.1).set({fb:0.15}),
                     T("adsr", "24db", 10, 3500));
    var op2 = T("*", T("oscx", T("+", T("phasor", freq), op1, 0.1)),
                     T("adsr", "24db", 2500));
    var op3 = T("*", T("oscx", T("phasor", freq + 2), 0.25),
                     T("adsr", "24db", 10, 3500));
    var op4 = T("*", T("oscx", T("+", T("phasor", freq), op3)),
                     T("adsr", "24db", 2500));
    
    var synth = T("+", op2, op4);
    
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
            if (synth.args.length > 4) {
                delete synth.noteon[synth.args.shift().midinote];
            }
        }
        s.set({mul:velocity / 128}).bang();
    } else {
        if (s) s.args[1].keyOff();
    }
}

return synth;
