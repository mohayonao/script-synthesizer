path    = require "path"
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

app.get "/mml", (req, res)->
    res.sendfile "#{__dirname}/views/mml.html"

app.get "/", (req, res)->
    res.sendfile "#{__dirname}/views/index.html"

app.listen process.env.PORT or 3000
