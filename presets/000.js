var synth = T("sin");

synth.noteon = function(midinote, velocity) {
    synth.freq.value = timbre.utils.mtof(midinote);
    synth.mul = velocity / 128;
};
synth.noteoff = function(midinote) {
    synth.mul = 0;
};

return synth;
