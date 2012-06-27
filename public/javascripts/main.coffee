"use strict"
jQuery ->
    window.synth = null

    prev_code = ""
    eval_synth = (code)->
        if prev_code != code
            _synth = null
            try
                _synth = eval("(function() {#{code}}());")
            finally
                _synth = null unless timbre.fn.isTimbreObject _synth
            if _synth
                timbre.dacs.removeAll()
                window.synth = _synth.play()
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

    interval = T("interval", 600, ->
        doremi = [72, 74, 76, 77, 79, 81, 83, 84]
        i = interval.count % doremi.length
        if window.synth?.noteon
            window.synth.noteon doremi[i], 64
    )

    window.testplay = (b)->
        if b then interval.on() else interval.off()
