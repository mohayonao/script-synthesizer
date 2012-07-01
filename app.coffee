path    = require "path"
http    = require "http"
https   = require "https"
url     = require "url"
express = require "express"

app = module.exports = express.createServer()

app.configure ->
    app.use express.bodyParser()
    app.use express.methodOverride()
    app.use app.router
    app.use express.static("#{__dirname}/public")

app.configure "development", ->
    app.use express.errorHandler(dumpExceptions:true, showStack:true)

app.configure "production", ->
    app.use express.errorHandler()

app.get "/presets/:id?", (req, res)->
    name = "000#{req.params.id}".substr(-3)
    filepath = "presets/#{name}.js"
    filepath = "presets/000.js" unless path.existsSync filepath
    res.header "Content-Type","text/plain"
    res.sendfile filepath

app.get "/api/synthdef/", (req, res)->
    if /^(https?):\/\/.*$/.test req.query.url
        opts     = url.parse req.query.url
        protocol = if /^https/.test opts.protocol then https else http
        uri = {
            host:opts.hostname,
            path:opts.pathname + (opts.search or "")
        }
        protocol.get uri, (http_get_res)->
            if http_get_res.statusCode is 200
                body = ""
                http_get_res.on "data", (chunk)->
                    body += chunk
                http_get_res.on "end", ->
                    res.send JSON.stringify {status:200, body:body}
            else res.send JSON.stringify {status:http_get_res.statusCode}
    else res.send JSON.stringify {status:-1}

app.get "/mml", (req, res)->
    res.sendfile "#{__dirname}/views/mml.html"

app.get "/", (req, res)->
    res.sendfile "#{__dirname}/views/index.html"

app.listen process.env.PORT or 3000
