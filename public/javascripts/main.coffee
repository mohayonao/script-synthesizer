"use strict"
jQuery ->
    window.synthdef = null

    prev_code = ""
    eval_synth = (code)->
        code = code.substr(code.indexOf "function")
        if prev_code != code
            _synthdef = null
            try
                _synthdef = eval "(function () { return #{code}; }());"
            catch e
                _synthdef = null
            finally
                _synthdef = null unless _synthdef instanceof Function
            if _synthdef
                window.synthdef = _synthdef
                $("#code").css "color", "black"
            else
                $("#code").css "color", "red"

    # UI
    selector = $("#synth-selector")
    Preset.forEach (name, i)->
        name = "000#{i}".substr(-3) + " :#{name}"
        selector.append $("<option>").text(name).attr("value", i)
    selector.on "change", ->
        n = $(@).val()
        jQuery.get "/presets/#{n}", (res)->
            $("#code").val res
            eval_synth res
    id = location.search.substr 1
    if /^\d{1,3}$/.test id then selector.val id|0
    selector.change()

    $("#code").on "keydown", (e)->
        if e.ctrlKey and e.keyCode is 32
            e.preventDefault()

    $("#code").on "keyup", (e)->
        if e.ctrlKey and e.keyCode is 32
            eval_synth $(this).val().trim()

    $("#volume").slider value:80, slide: ->
        timbre.amp = $(this).slider("value") / 100

    # Test Play
    interval = T("interval", 600, ->
        doremi = [72, 74, 76, 77, 79, 81, 83, 84]
        i = interval.count % doremi.length
        if window.synth?.noteon
            window.synth.noteon doremi[i], 64
    )

    window.testplay = (b)->
        if b then interval.on() else interval.off()

    # synth
    synth = T("+").play()
    synth.noteOn = {}

    # WebMidiLink
    receiver = new webmidilink.Receiver 0

    receiver.onNoteOn = (notenumber, velocity)->
        s = synth.noteOn[notenumber];
        unless s
            freq = timbre.utils.mtof notenumber
            s = window.synthdef? freq
            return unless timbre.fn.isTimbreObject s
            synth.noteOn[notenumber] = s.appendTo(synth)
            s.notenumber = notenumber
            s.onended = ->
                delete synth.noteOn[s.removeFrom(synth).notenumber]
            if synth.args.length > (synth.poly or 4)
                delete synth.noteOn[synth.args.shift().notenumber]
        s.set(mul:velocity / 128).keyon()
    receiver.onNoteOff = (notenumber, velocity)->
        synth.noteOn[notenumber]?.keyoff()
    receiver.onAllSoundOff = ()->
        while synth.args.length > 0
            delete synth.noteOn[synth.args.shift().notenumber]
