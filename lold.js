var bee = require("beeline");
var play = require('play').Play();
var applescript = require("applescript");
var Emitter = require('events').EventEmitter;
var ev = new Emitter();
var itunes = {
    pause_script: 'tell application "iTunes" to pause',
    play_script: 'tell application "iTunes" to play',
    is_playing_script: 'tell application "iTunes" if player state is paused then return true else return false',
    isPlaying: function(sfx){
        applescript.execFile('./applescripts/getItunesStatus.applescript', function(err, rtn) {
            console.log(rtn);
            console.log("rtn is " + typeof rtn);
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
        
        applescript.execString(itunes.pause_script, function(err, rtn) {
            itunes.wasPlaying = true;
            if (typeof callback === "function"){
                callback.call(this,err,rtn);
            }
        });
    },
    play: function(callback){
        console.log('itunes.play running');
        applescript.execString(itunes.play_script, function(err, rtn) {
            console.log('itunes is playing');
            if (typeof callback === "function"){
                callback.call(this,err,rtn);
            }
        });
    }
};
var lol = {
    awake: true,
    play: function(path){ 
        itunes.isPlaying(path);
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
        }, 1 * 60 * 1000);
    }
};

var lolz = {
    "thingsucks" : './sfx/fts.mp3',
    "forensic" : './sfx/forensic.mp3',
    "facebook" : './sfx/facebook.mp3'
};

var router = bee.route({ // Create a new router

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