/**
 * 017: Drawbar Organ
 * author: @mohayonao
 */
var freq  = T(0);
var synth = T("*", T("+", T("sin", freq),
                          T("sin", T("*", freq, 2).kr(), 0.5),
                          T("sin", T("*", freq, 3).kr(), 0.25),
                          T("sin", T("*", freq, 5).kr(), 0.125)),
                   T("adsr", "24db", 5, 100, 0.9, 10));

synth.noteon = function(midinote, velocity) {
    freq.value = timbre.utils.mtof(midinote);
    synth.args[0].mul = velocity / 128;
    synth.args[1].bang();
};
synth.noteoff = function(midinote) {
    synth.args[1].keyOff();
};

return synth;
