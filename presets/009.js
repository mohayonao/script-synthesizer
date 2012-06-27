/**
 * 009: Celesta
 * author: @mohayonao
 */
var synth = T("+");

function synthdef(freq) {
    var op2 = T("oscx", T("phasor", freq * 14, 0.25));
    var op1 = T("*", T("oscx", T("+", T("phasor", freq), op2), 0.5),
                     T("perc", "24db", 2500));
    return op1;
}

synth.noteon = function(midinote, velocity) {
    var s = synth.noteon[midinote];
    
    if (velocity > 0) {
        if (! s) {
            var freq = timbre.utils.mtof(midinote);
            s = synth.noteon[midinote] = synthdef(freq).appendTo(synth);
            s.midinote = midinote;
            s.args[1].onended = function() {
                delete synth.noteon[s.removeFrom(synth).midinote];
            };
            if (synth.args.length > 4) {
                delete synth.noteon[synth.args.shift().midinote];
            }
        }
        s.args[1].set({mul:velocity / 128}).bang();
    } else {
        if (s) s.args[1].keyOff();
    }
}

return synth;
