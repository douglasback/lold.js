var bee = require("beeline");
var play = require('play').Play();
var applescript = require("applescript");
var lolz = require("./lolz").clips;
var Emitter = require('events').EventEmitter;
var ev = new Emitter();
var itunes = {
    pause_script: 'tell application "iTunes" to pause',
    play_script: 'tell application "iTunes" to play',
    isOpen: function(sfx){
        ev.emit("check-itunes-open-start");
        applescript.execFile('./applescripts/isItunesOpen.applescript', function(err, rtn) {
            ev.emit("check-itunes-open-end");
            if (rtn === "true"){
                itunes.isPlaying(sfx);
            } else {
                play.sound(sfx);
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
        console.log("lold event emitted");
        lol.awake = false;
        console.log("lol.awake === " + lol.awake);
        ev.emit('lolToSleep');
    },
    setTimer: function(){
        console.log("loltoSleep event emitted");
        setTimeout(function(){
            lol.awake = true;
            console.log("lol.awake === " + lol.awake);
        }, 1000);
    }
};

var router = bee.route({ // Create a new router
    "/list" : function(req,res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write("Here is a list of available sounds:\n");
        for (i in lolz){
            res.write(i + "\n");
        }
        res.end();
    },
    "r`^/([\\w]+)$`": function(req, res, matches) {
        // Matches is an array / matches[0] will be the sound we want to play
        // if matches[0] is a key in the lolz object, we'll pass that to lol.play
        // otherwise, we 404
        if (lolz[matches[0]] !== undefined){
            console.log(matches);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            if (lol.awake){
                lol.play(lolz[matches[0]]);
                res.end(matches[0]);
            } else {
                res.end('sleeping');
            }
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end("Nope.");
            
        }
        
        
    },
    "`404`": function(req, res) {
        // Called when no other route rule are matched
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end("Nope.");
        
    },
    "`503`": function(req, res, err) {
        // Called when an exception is thrown by another router function
        // The error that caused the exception is passed as the third parameter
        // This _not_ guarranteed to catch all exceptions
    }
});
require("http").createServer(router).listen(8001); // Starts serve with routes defined above
ev.on('lold', lol.goToSleep);
ev.on('lolToSleep', lol.setTimer);
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