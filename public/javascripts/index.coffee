"use strict"
jQuery ->

    # Query String
    Q = do ->
        Q = {}
        search = location.search.substr 1
        search.split("&").forEach (x)->
            x = x.split "="
            if x.length is 0 then Q[x[0]] = true
            else Q[x[0]] = x[1]
        return Q


    # Synth
    Synth = T("+").play()
    Synth.noteOn = {}
    Synth.def  = null
    Synth.eval = (code, verbose)->
        Synth.source = code
        code = code.substr(code.indexOf "function")

        [def, msg] = [null, ""]
        try
            def = eval "(function() { return #{code}; }())"
        catch e
            [def, msg] = [null, e.toString()]

        if def != null
            if def instanceof Function
                unless timbre.fn.isTimbreObject(def 0)
                    [def, msg]= [null, "SynthDef should return a TimbreObject."]
            else
                [def, msg] = [null, "SynthDef should be an instance of Funtion."]

        if def != null
            MidiReceiver.onAllSoundOff()
            Synth.def = def
            if verbose then showMessage "success", "That's a nice!!"
        else if verbose
            showMessage "error", msg
        $("#evalSynthDef").attr(disabled:true)


    # WaveViewer
    Viewer = new WaveViewer(null, 60, "viewer", 512, 256)
    Viewer.listener = {
        wave: T("rec",   60, 50).set({overwrite:true}),
        fft : T("fft", 1024, 50)
    }
    Viewer.select = (type)->
        Viewer.current?.listen null
        switch type
            when "wave"
                Viewer.current = Viewer.listener.wave.listen(Synth).on().bang()
                Viewer.target = Viewer.current.buffer
                Viewer.range  = [-1, 1]
            when "fft"
                Viewer.current = Viewer.listener.fft.listen(Synth).on().bang()
                Viewer.target = Viewer.current.spectrum
                Viewer.range  = [0, 30000]
            when "*"
                Viewer.current.listen(Synth).on().bang()
    Viewer.select "wave"


    # SynthDef Editor
    SynthDefEditor = CodeMirror.fromTextArea $("#editor").get(0), {
        theme:"blackboard", lineNumbers:true, keyMap:"emacs",
        onChange: ->
            $("#evalSynthDef").attr(disabled:false)
        onFocus: (self)->
            self.onFocused = true
            showMessage "info", "Use C-x C-e to eval SynthDef."
        onBlur : (self)->
            self.onFocused = false
    }
    CodeMirror.keyMap["emacs-Ctrl-X"]["Ctrl-E"] = (e)->
        Synth.eval SynthDefEditor.getValue().trim(), true
    CodeMirror.keyMap["emacs-Ctrl-X"]["Ctrl-S"] = (e)->
        localStorage.setItem "SynthDef", SynthDefEditor.getValue().trim()
        showMessage "info", "Saved this SynthDef."
    CodeMirror.keyMap["emacs-Ctrl-X"]["Ctrl-F"] = (e)->
        def = localStorage.getItem "SynthDef"
        if def
            SynthDefEditor.setValue def
            showMessage "info", "Loaded a SynthDef."

    SynthDefEditor.prevKeyCode = 0
    SynthDefEditor.onFocused   = false
    window.Editor = SynthDefEditor


    # UI
    PresetSelector = $("#preset")
    Preset.forEach (name, i)->
        name = "000#{i}".substr(-3) + " :#{name}"
        PresetSelector.append $("<option>").text(name).attr("value", i)
    PresetSelector.on "change", ->
        n = $(@).val()
        jQuery.get "/presets/#{n}", (res)->
            SynthDefEditor.setValue res
            Synth.eval res
    PresetSelector.val 1
    if /^\d{1,3]$/.test Q.p then PresetSelector.val Q.p|0
    PresetSelector.change()

    $("#viewer-wave").on "click", -> Viewer.select "wave"
    $("#viewer-fft" ).on "click", -> Viewer.select "fft"

    $("#tab a").click (e)->
        if e.target.hash is "#tabViewer"
            Viewer.start()
            Viewer.select "*"
        else
            Viewer.pause()
            Viewer.select "none"
        if e.target.hash is "#tabSynthDef"
            setTimeout (->SynthDefEditor.refresh()), 0

    $("#evalSynthDef").on "click", ->
        Synth.eval SynthDefEditor.getValue().trim(), true

    showMessage = (type, msg)->
        $alert = $("#alert")
        ["info", "success", "error"].forEach (x)-> $alert.removeClass "alert-#{x}"
        $alert.addClass("alert-#{type}").css("display", "block")
        $("strong", $alert).text {
            info:"INFO:", success:"WELL DONE!", error:"OH SNAP!"
        }[type] or ""
        $(".msg", $alert).text msg


    # KeyMapping
    KeyMapping = {
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
        keyDown: {}
    }
    window.addEventListener "keydown", (e)->
        return if e.ctrlKey or e.altKey or e.metaKey
        return if SynthDefEditor.onFocused
        return if KeyMapping.keyDown[e.keyCode]
        notenumber = KeyMapping[e.keyCode]
        if notenumber then MidiReceiver.onNoteOn notenumber, 64
        KeyMapping.keyDown[e.keyCode] = true
    window.addEventListener "keyup", (e)->
        return if e.ctrlKey or e.altKey or e.metaKey
        return if SynthDefEditor.onFocused
        notenumber = KeyMapping[e.keyCode]
        if notenumber then MidiReceiver.onNoteOff notenumber, 0
        KeyMapping.keyDown[e.keyCode] = false


    # WebMidiLink
    MidiReceiver = new webmidilink.Receiver 0

    MidiReceiver.onNoteOn = (notenumber, velocity)->
        s = Synth.noteOn[notenumber]
        if s is undefined

          freq = timbre.utils.mtof notenumber
          s = Synth.def? freq
          return unless timbre.fn.isTimbreObject s
          Synth.noteOn[notenumber] = s.appendTo(Synth)
          s.notenumber = notenumber
          s.onended = ->
            delete Synth.noteOn[s.removeFrom(Synth).notenumber]
          if Synth.args.length > 4
            delete Synth.noteOn[Synth.args.shift().notenumber]
        s.set(mul:(velocity / 128) * 0.5).keyon()
    MidiReceiver.onNoteOff = (notenumber, velocity)->
        Synth.noteOn[notenumber]?.keyoff()
    MidiReceiver.onAllSoundOff = ->
        while Synth.args.length > 0
            delete Synth.noteOn[Synth.args.shift().notenumber]
