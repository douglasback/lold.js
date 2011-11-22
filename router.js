var bee = require("beeline");
var play = require('play').Play();
var applescript = require("applescript");

var itunes = {
    pause_script: 'tell application "iTunes" to pause',
    play_script: 'tell application "iTunes" to play',
    
    pause: function(callback){
        applescript.execString(itunes.pause_script, function(err, rtn) {
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
    play: function(path){ 
        itunes.pause(function(){
            play.sound(path, function(){

                itunes.play();
            });
        });
    }
}; 

var router = bee.route({ // Create a new router
    "/thingsucks": function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});

        lol.play('./sfx/fts.mp3');
        res.end('thingsucks');

    },
    "/play": function(req,res){
        itunes.play();
        res.end('played');
        
    },
    "r`^/name/([\\w]+)/([\\w]+)$`": function(req, res, matches) {
        // Called when req.url matches this regex: "^/name/([\\w]+)/([\\w]+)$"
        // An array of captured groups is passed as the third parameter
        // For example if req.url === "/name/smith/will" then matches === [ "smith", "will" ]
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
