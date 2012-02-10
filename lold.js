var express = require("express"),
    app = module.exports = express.createServer(),
    play = require('play').Play(),
    applescript = require("applescript"),
    lolz = require("./lolz").clips,
    Emitter = require('events').EventEmitter,
    ev = new Emitter(),
    debugMode = false,
    sleepForMinutes = debugMode ? 0.1 : 15,
    pollingInterval = 2;
    
var itunes = {
    pause_script: 'tell application "iTunes" to pause',
    play_script: 'tell application "iTunes" to play',
    primeIt: function(callback){
        applescript.execFile('./applescripts/isItunesOpen.applescript', function(err, rtn) {
            if (rtn === "true"){
                if (debugMode) console.log("iTunes is open, pump is primed");
            } else {
                if (debugMode) console.log("iTunes is closed, pump is primed");
            }
        });
        if (typeof callback == "function"){
            callback.call();
        }
    },
    isOpen: function(sfx){
        ev.emit("check-itunes-open-start");
        applescript.execFile('./applescripts/isItunesOpen.applescript', function(err, rtn) {
            ev.emit("check-itunes-open-end");
            if (rtn === "true"){
                itunes.isPlaying(sfx);
            } else {
                play.sound(sfx);
                ev.emit('lold', sfx);
            }
        });
    },
    isPlaying: function(sfx){
        ev.emit("check-itunes-playing-start");
        applescript.execFile('./applescripts/getItunesStatus.applescript', function(err, rtn) {
            ev.emit("check-itunes-playing-end");
            if (rtn === "true"){
                itunes.pause(function(){
                    play.sound(sfx, function(){
                        ev.emit('lold', sfx);
                        itunes.play();
                    });
                });
            } else {
                play.sound(sfx, function(){
                    ev.emit('lold', sfx);
                    
                });
            }
        });
    },
    pause: function(callback){
        ev.emit("itunes-pause-start");
        applescript.execString(itunes.pause_script, function(err, rtn) {
            ev.emit("itunes-pause-end");
            if (typeof callback === "function"){
                callback.call(this,err,rtn);
            }
        });
    },
    play: function(callback){
        ev.emit("itunes-play-start");
        applescript.execString(itunes.play_script, function(err, rtn) {
            ev.emit("itunes-play-end");
            if (typeof callback === "function"){
                callback.call(this,err,rtn);
            }
        });
    }
};
var lol = {
    awake: true,
    play: function(path){ 
        itunes.isOpen(path);
    },
    goToSleep: function(){
        if (debugMode) console.log("lold event emitted");
        lol.awake = false;
        if (debugMode) console.log("lol.awake === " + lol.awake);
        ev.emit('lolToSleep');
    },
    setTimer: function(){
        if (debugMode) console.log("loltoSleep event emitted");
        setTimeout(function(){
            lol.awake = true;
            if (debugMode) console.log("lol.awake === " + lol.awake);
        }, (sleepForMinutes * 60 * 1000));
    },
    getStatusAsString: function(){
        return lol.awake ? "awake" : "sleeping";
    }
};

app.get('/list', function(req, res){
    res.contentType('text/plain');
    res.send("Here is a list of available sounds:\n");
    for (i in lolz){
        res.send(i + "\n");
    }
});
app.get("/status", function(req, res){
    res.contentType('text/plain');

    res.send("lold.js is " + lol.getStatusAsString() + "\n");
});
app.get("/prime", function(req,res){
    console.log("priming");
    itunes.primeIt(function(){
        res.contentType("text/plain");
        res.send("The pump is primed.");
    });
});
app.get("/:sound", function(req,res){
    res.contentType('text/plain');
    
    if (lolz[req.param("sound")] !== undefined){
        console.log(req.param("sound") + " (" + lol.getStatusAsString() + ")");
        if (lol.awake){
            lol.play(lolz[req.param("sound")]);
            res.send(lolz[req.param("sound")]);
        } else {
            res.send('sleeping');
        }
    } else {
        res.contentType('text/plain');

        res.send("Nope.");
        
    }
});

app.listen(8001); // Starts serve with routes defined above
ev.on('lold', lol.goToSleep);
ev.on('lolToSleep', lol.setTimer);
setInterval(function(){
    if (lol.awake) itunes.primeIt(); }
    , (pollingInterval * 60 * 1000));
    
if (!!debugMode){
    ev.on("check-itunes-open-start", function(){
        console.time("check-itunes-open")
    });
    ev.on("check-itunes-open-end", function(){
         console.timeEnd("check-itunes-open")
    });
    ev.on("check-itunes-playing-start", function(){
         console.time("check-itunes-playing")
    });
    ev.on("check-itunes-playing-end", function(){
         console.timeEnd("check-itunes-playing")
    });
    ev.on("itunes-pause-start", function(){
         console.time("itunes-pausing")
    });
    ev.on("itunes-pause-end", function(){
         console.timeEnd("itunes-pausing")
    });
    ev.on("itunes-play-start", function(){
         console.time("itunes-resuming")
    });
    ev.on("itunes-play-end", function(){
         console.timeEnd("itunes-resuming")
    });
}