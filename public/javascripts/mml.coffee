jQuery ->
    timbre.setup {streamsize:512}

    sender = new webmidilink.Sender 0
    sender.queue = []

    class MMLCommand
        constructor: (name, sign, length, dot)->
            @name = name
            @type = "><lov".indexOf(name) != -1 # true:control, false:tone
            @sign = sign
            @length = (length or 0)|0
            @dot    = (dot or "").length

    class MMLTrack
        constructor: (mml)->
            re = /([><tlovcdefgabr])([-+]?)(\d*)(\.*)/ig
            commands = []
            while true
                m = re.exec mml
                if not m then break
                else if m[1] is "t" then bpm = (m[3] or 120)|0
                else commands.push new MMLCommand(m[1], m[2], m[3], m[4])
            bpm      = 120
            index    = 0
            octave   = 5
            len      = 4
            dot      = 0
            velocity = 8
            samples  = 0
            msg      = ""

            fetch = ->
                cmd = commands[index++]
                index %= commands.length

                if cmd.type
                    switch cmd.name
                        when "<" then octave += 1
                        when ">" then octave -= 1
                        when "l" then [len, dot] = [cmd.length, cmd.dot]
                        when "o" then octave   = cmd.length
                        when "v" then velocity = cmd.length
                    cmd = fetch()
                return cmd

            @seq = ->
                if samples <= 0
                    sender.queue.shift()?()
                    cmd = fetch()
                    if cmd.name != "r"
                        _midino = timbre.utils.atom(cmd.name.toUpperCase() + (octave-1))
                        switch cmd.sign
                            when "+" then _midino++
                            when "-" then _midino--
                        _velocity = (velocity / 15 * 128)|0
                        _midino   = _midino.toString   0x10
                        _velocity = _velocity.toString 0x10

                        sender.noteOn _midino, _velocity
                        sender.queue.push ()-> sender.noteOff _midino, _velocity

                    _dot = cmd.dot
                    _dot = dot if _dot is 0 and cmd.length is 0
                    _len = cmd.length
                    _len = len unless _len
                    _len = timbre.samplerate * (60 / bpm) * (4 / _len)
                    _len *= 1.5 while _dot--
                    samples += _len|0
                samples -= timbre.cellsize

    mml = T("interval", 0, -> mml.track.seq())

    $("#open").on "click", ->
        sender.webi.close() if sender.webi
        url = $("#webi").val() or "/"
        sender.webi = window.open url, null, "width=900,height=670,scrollbars=yes,resizable=yes"

    $("#play").on "click", ->
        if mml.isOn
            mml.off()
            $(this).text "play"
        else if sender.webi != null
            mml.track = new MMLTrack $("#code").val().trim().toLowerCase()
            mml.on()
            $(this).text "stop"
