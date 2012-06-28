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
                receiver.onAllSoundOff()
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

    isEditing = false
    $("#code").on "focus", (e)-> isEditing = true
    $("#code").on "blur" , (e)-> isEditing = false

    $("#code").on "keydown", (e)->
        if e.ctrlKey and e.keyCode is 32
            e.preventDefault()

    $("#code").on "keyup", (e)->
        if e.ctrlKey and e.keyCode is 32
            eval_synth $(this).val().trim()

    $("#volume").slider value:80, slide: ->
        timbre.amp = $(this).slider("value") / 100

    $("#mute").on "click", ->
        if timbre.amp
            timbre.amp = 0
            $(this).css "color", "blue"
        else
            timbre.amp = 0.8
            $(this).css "color", "black"

    $("#reload").on "click", ->
        selector.change()

    # Test Play
    interval = T("interval", 600, ->
        doremi = [72, 74, 76, 77, 79, 81, 83, 84]
        i = interval.count % doremi.length
        if window.synth?.noteon
            window.synth.noteon doremi[i], 64
    )

    window.testplay = (b)->
        if b then interval.on() else interval.off()

    # Synth
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


    # Keyboad to Keyboad
    key2notenumber = {
        90 : 48 # Z -> C2
        83 : 49 # S -> C+2
        88 : 50 # X -> D2
        68 : 51 # D -> D+2
        67 : 52 # C -> E2
        86 : 53 # V -> F2
        71 : 54 # G -> F+2
        66 : 55 # B -> G2
        72 : 56 # H -> G+2
        78 : 57 # N -> A2
        74 : 58 # J -> A+2
        77 : 59 # M -> B2
        188: 60 # , -> C3
        76 : 61 # L -> C+3
        190: 62 # . -> D3
        186: 63 # ; -> D+3

        81 : 60 # Q -> C3
        50 : 61 # 2 -> C+3
        87 : 62 # W -> D3
        51 : 63 # 3 -> D+3
        69 : 64 # E -> E3
        82 : 65 # R -> F3
        53 : 66 # 5 -> F+3
        84 : 67 # T -> G3
        54 : 68 # 6 -> G+3
        89 : 69 # Y -> A3
        55 : 70 # 7 -> A+3
        85 : 71 # U -> B3
        73 : 72 # I -> C4
        57 : 73 # 9 -> C#4
        79 : 74 # O -> D4
        48 : 75 # 0 -> D+4
        80 : 76 # P -> E4
    }

    isKeyDown = {}
    window.addEventListener "keydown", (e)->
        return if isEditing
        return if isKeyDown[e.keyCode]
        notenumber = key2notenumber[e.keyCode]
        if notenumber
            receiver.onNoteOn notenumber, 64
        isKeyDown[e.keyCode] = true

    window.addEventListener "keyup", (e)->
        return if isEditing
        notenumber = key2notenumber[e.keyCode]
        if notenumber then receiver.onNoteOff notenumber, 0
        isKeyDown[e.keyCode] = false
