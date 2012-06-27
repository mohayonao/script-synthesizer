/**
 * 081: Lead 1 (square)
 * author: @mohayonao
 */
var synth = T("+");

function synthdef(freq) {
    var s = T("*", T("pulse", freq),
                   T("adsr", "24db", 5, 100, 0.7, 10));
    return s;
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
