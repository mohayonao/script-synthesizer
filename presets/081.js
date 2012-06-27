/**
 * 081: Lead 1 (square)
 * author: @mohayonao
 */
var synth = T("*", T("pulse"),
                   T("adsr", "24db", 5, 100, 0.7, 10));

synth.noteon = function(midinote, velocity) {
    synth.args[0].freq.value = timbre.utils.mtof(midinote);
    synth.args[0].mul = velocity / 128;
    synth.args[1].bang();
};
synth.noteoff = function(midinote) {
    synth.args[1].keyOff();
};

return synth;
