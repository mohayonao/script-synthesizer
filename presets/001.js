/**
 * 001: Acoustic Piano
 * author: @mohayonao
 */
var synth = T("+");

function synthdef(freq) {
    var s = T("*", T("+", T("sin", freq),
                          T("sin", freq * 2, 0.5),
                          T("sin", freq * 4, 0.25),
                          T("sin", freq * 5, 0.125)),
                   T("adsr", "24db", 5, 2500));
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
